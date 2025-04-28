'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ContactCard } from "@/components/ContactCard"
import { CompanyCard } from "@/components/CompanyCard"
import { searchContacts, getFacets, searchFacetValues, multisearch } from "@/lib/search"
import { X } from "lucide-react"

export default function Home() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    jobTitle: [],
    location: [],
    industry: [],
    companyLocationRegion: [],
    companyLocationLocality: [],
    companyLocationCountry: [],
  })
  const [results, setResults] = useState(null)
  const [facets, setFacets] = useState(null)
  const [loading, setLoading] = useState(false)
  const [facetSearch, setFacetSearch] = useState({
    jobTitle: '',
    location: '',
    industry: '',
    companyLocationRegion: '',
    companyLocationLocality: '',
    companyLocationCountry: '',
  })
  const [facetResults, setFacetResults] = useState({
    jobTitle: [],
    location: [],
    industry: [],
    companyLocationRegion: [],
    companyLocationLocality: [],
    companyLocationCountry: [],
  })
  const [showSuggestions, setShowSuggestions] = useState({
    jobTitle: false,
    location: false,
    industry: false,
    companyLocationRegion: false,
    companyLocationLocality: false,
    companyLocationCountry: false,
  })

  useEffect(() => {
    const fetchFacets = async () => {
      const data = await getFacets()
      setFacets(data)
    }
    fetchFacets()
  }, [])

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await multisearch({ 
        query, 
        filters 
      })
      setResults(response)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [query, filters])

  // Search for facet values when facet search query changes
  useEffect(() => {
    const searchFacets = async () => {
      const facetNames = {
        jobTitle: 'worksFor.jobTitle',
        location: 'address.addressLocality',
        industry: 'worksFor.company.industry',
        companyLocationRegion: 'worksFor.company.address.addressRegion',
        companyLocationLocality: 'worksFor.company.address.addressLocality',
        companyLocationCountry: 'worksFor.company.address.addressCountry',
      }

      const results = {}
      for (const [key, value] of Object.entries(facetSearch)) {
        if (value) {
          const response = await searchFacetValues({
            facetName: facetNames[key],
            facetQuery: value,
            filters,
          })
          results[key] = response.facetHits
        } else {
          results[key] = []
        }
      }
      setFacetResults(results)
    }

    searchFacets()
  }, [facetSearch, filters])

  // Trigger search when query or filters change
  useEffect(() => {
    performSearch()
  }, [performSearch])

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const currentValues = prev[key] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value) // Remove if already selected
        : [...currentValues, value] // Add if not selected
      
      return {
        ...prev,
        [key]: newValues
      }
    })
    setShowSuggestions({...showSuggestions, [key]: false})
    setFacetSearch(prev => ({...prev, [key]: ''})) // Clear the filter search bar
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search and Filters Section */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input 
                  placeholder="Search contacts and companies..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filter contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Filters */}
              {Object.entries(filters).some(([_, values]) => 
                (Array.isArray(values) ? values.length > 0 : values)
              ) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Selected Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, values]) => {
                      if (!values || (Array.isArray(values) && !values.length)) return null;
                      
                      return values.map((value, index) => (
                        <div
                          key={`${key}-${value}-${index}`}
                          className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                        >
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: {value}</span>
                          <button
                            onClick={() => handleFilterChange(key, value)}
                            className="ml-1 rounded-full p-0.5 hover:bg-accent"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ));
                    })}
                  </div>
                </div>
              )}

              {/* Job Title Filter */}
              <div className="relative">
                <h3 className="text-sm font-medium mb-2">Job Title</h3>
                <Input
                  placeholder="Search job titles..."
                  value={facetSearch.jobTitle || ''}
                  onChange={(e) => {
                    setFacetSearch({...facetSearch, jobTitle: e.target.value})
                    setShowSuggestions({...showSuggestions, jobTitle: true})
                  }}
                  onFocus={() => setShowSuggestions({...showSuggestions, jobTitle: true})}
                />
                {showSuggestions.jobTitle && facetResults.jobTitle.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    {facetResults.jobTitle.map((job) => (
                      <div
                        key={job.value}
                        className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          filters.jobTitle.includes(job.value) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleFilterChange('jobTitle', job.value)}
                      >
                        {job.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div className="relative">
                <h3 className="text-sm font-medium mb-2">Location</h3>
                <Input
                  placeholder="Search locations..."
                  value={facetSearch.location || ''}
                  onChange={(e) => {
                    setFacetSearch({...facetSearch, location: e.target.value})
                    setShowSuggestions({...showSuggestions, location: true})
                  }}
                  onFocus={() => setShowSuggestions({...showSuggestions, location: true})}
                />
                {showSuggestions.location && facetResults.location.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    {facetResults.location.map((location) => (
                      <div
                        key={location.value}
                        className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          filters.location.includes(location.value) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleFilterChange('location', location.value)}
                      >
                        {location.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Industry Filter */}
              <div className="relative">
                <h3 className="text-sm font-medium mb-2">Industry</h3>
                <Input
                  placeholder="Search industries..."
                  value={facetSearch.industry || ''}
                  onChange={(e) => {
                    setFacetSearch({...facetSearch, industry: e.target.value})
                    setShowSuggestions({...showSuggestions, industry: true})
                  }}
                  onFocus={() => setShowSuggestions({...showSuggestions, industry: true})}
                />
                {showSuggestions.industry && facetResults.industry.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    {facetResults.industry.map((industry) => (
                      <div
                        key={industry.value}
                        className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          filters.industry.includes(industry.value) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleFilterChange('industry', industry.value)}
                      >
                        {industry.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Location Locality Filter */}
              <div className="relative">
                <h3 className="text-sm font-medium mb-2">Company Locality</h3>
                <Input
                  placeholder="Search company localities..."
                  value={facetSearch.companyLocationLocality || ''}
                  onChange={(e) => {
                    setFacetSearch({...facetSearch, companyLocationLocality: e.target.value})
                    setShowSuggestions({...showSuggestions, companyLocationLocality: true})
                  }}
                  onFocus={() => setShowSuggestions({...showSuggestions, companyLocationLocality: true})}
                />
                {showSuggestions.companyLocationLocality && facetResults.companyLocationLocality.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    {facetResults.companyLocationLocality.map((location) => (
                      <div
                        key={location.value}
                        className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          filters.companyLocationLocality.includes(location.value) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleFilterChange('companyLocationLocality', location.value)}
                      >
                        {location.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Location Region Filter */}
              <div className="relative">
                <h3 className="text-sm font-medium mb-2">Company Region</h3>
                <Input
                  placeholder="Search company regions..."
                  value={facetSearch.companyLocationRegion || ''}
                  onChange={(e) => {
                    setFacetSearch({...facetSearch, companyLocationRegion: e.target.value})
                    setShowSuggestions({...showSuggestions, companyLocationRegion: true})
                  }}
                  onFocus={() => setShowSuggestions({...showSuggestions, companyLocationRegion: true})}
                />
                {showSuggestions.companyLocationRegion && facetResults.companyLocationRegion.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    {facetResults.companyLocationRegion.map((location) => (
                      <div
                        key={location.value}
                        className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          filters.companyLocationRegion.includes(location.value) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleFilterChange('companyLocationRegion', location.value)}
                      >
                        {location.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Location Country Filter */}
              <div className="relative">
                <h3 className="text-sm font-medium mb-2">Company Country</h3>
                <Input
                  placeholder="Search company countries..."
                  value={facetSearch.companyLocationCountry || ''}
                  onChange={(e) => {
                    setFacetSearch({...facetSearch, companyLocationCountry: e.target.value})
                    setShowSuggestions({...showSuggestions, companyLocationCountry: true})
                  }}
                  onFocus={() => setShowSuggestions({...showSuggestions, companyLocationCountry: true})}
                />
                {showSuggestions.companyLocationCountry && facetResults.companyLocationCountry.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    {facetResults.companyLocationCountry.map((country) => (
                      <div
                        key={country.value}
                        className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                          filters.companyLocationCountry.includes(country.value) ? 'bg-accent/50' : ''
                        }`}
                        onClick={() => handleFilterChange('companyLocationCountry', country.value)}
                      >
                        {country.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loading ? (
                  <p className="text-center text-muted-foreground">Searching...</p>
                ) : (
                  <>
                    {/* Contacts Section */}
                    {results?.contacts?.hits?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contacts</h3>
                        {results.contacts.hits.map((contact) => (
                          <ContactCard key={contact._id} contact={contact} />
                        ))}
                      </div>
                    )}

                    {/* Companies Section */}
                    {results?.companies?.hits?.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Companies</h3>
                        {results.companies.hits.map((company) => (
                          <CompanyCard key={company._id} company={company} />
                        ))}
                      </div>
                    )}

                    {(!results?.contacts?.hits?.length && !results?.companies?.hits?.length) && (
                      <p className="text-center text-muted-foreground">
                        {results ? 'No results found' : 'Start searching to see results'}
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
