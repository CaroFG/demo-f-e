import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CompanyCard({ company }) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary">{company.name}</h3>
            {company.industry && (
              <p className="text-sm text-primary/70">{company.industry}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {company.description && (
            <p className="text-sm text-primary/90" dangerouslySetInnerHTML={{ __html: company._formatted?.description || company.description }} />
          )}
          {company.address && (
            <div>
              <p className="text-sm text-primary/80">
                {company.address.addressLocality}
                {company.address.addressCountry && `, ${company.address.addressCountry}`}
              </p>
            </div>
          )}
          {company.url && (
            <a 
              href={company.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Visit website
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 