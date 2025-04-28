import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY,
})

export async function multisearch({ query = '', filters = {} }) {
  const queries = [
    {
      indexUid: 'contacts',
      q: query,
      filter: Object.entries(filters)
        .filter(([_, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
        .map(([key, value]) => {
          const values = Array.isArray(value) ? value : [value]
          
          if (key === 'jobTitle') {
            return `worksFor.jobTitle IN [${values.map(v => `"${v}"`).join(', ')}]`
          }
          if (key === 'location') {
            return `address.addressLocality IN [${values.map(v => `"${v}"`).join(', ')}]`
          }
          if (key === 'industry') {
            return `worksFor.company.industry IN [${values.map(v => `"${v}"`).join(', ')}]`
          }
          if (key === 'companyLocationRegion') {
            return `worksFor.company.address.addressRegion IN [${values.map(v => `"${v}"`).join(', ')}]`
          }
          if (key === 'companyLocationLocality') {
            return `worksFor.company.address.addressLocality IN [${values.map(v => `"${v}"`).join(', ')}]`
          }
          return `${key} IN [${values.map(v => `"${v}"`).join(', ')}]`
        })
        .join(' AND '),
      limit: 20,
      attributesToHighlight: ['*'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    }
  ]

  // Only add company search if there's a query
  if (query) {
    queries.push({
      indexUid: 'companies',
      q: query,
      limit: 20,
      attributesToHighlight: ['*'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
      hybrid: {
        semanticRatio: 0.8,
        embedder: "default"
      }
    })
  }

  const search = await client.multiSearch({ queries })

  return {
    contacts: search.results[0],
    companies: query ? search.results[1] : { hits: [] }
  }
}

export async function searchFacetValues({
  facetName,
  facetQuery = ''
}) {
  const index = client.index('contacts')

  const response = await index.searchForFacetValues({
    facetName,
    facetQuery,
  })

  return response
}

export async function getFacets() {
  const index = client.index('contacts')
  
  const response = await index.search('', {
    limit: 0,
    facets: [
      'worksFor.jobTitle',
      'address.addressLocality',
      'worksFor.company.industry',
      'worksFor.company.address.addressRegion',
      'worksFor.company.address.addressLocality',
    ],
  })

  return response.facets
} 