import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ContactCard({ contact }) {
  const jobs = contact?.worksFor || []
  const location = contact?.address?.addressLocality
  const country = contact?.address?.addressCountry

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contact.firstname} {contact.lastname}</CardTitle>
        {location && (
            <div className="text-sm text-muted-foreground">
              Based in {location}{country ? `, ${country}` : ''}
            </div>
          )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{job.jobTitle}</span>
                {job.company?.name && (
                  <>
                    <span>at</span>
                    <span className="text-muted-foreground">{job.company.name}</span>
                  </>
                )}
              </div>
              {job.company?.industry && (
                <div className="text-sm text-muted-foreground">
                  Industry: {job.company.industry}
                </div>
              )}
              {job.company?.address && (
                <div className="text-sm text-muted-foreground">
                  Company Location: {[
                    job.company?.address?.addressLocality,
                    job.company?.address?.addressRegion,
                    job.company?.address?.addressCountry
                  ].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 