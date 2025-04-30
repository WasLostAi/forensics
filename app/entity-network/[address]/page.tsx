import { EntityNetworkGraph } from "@/components/entity-network-graph"
import { getEntityByAddress } from "@/lib/entity-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EntityNetworkPageProps {
  params: {
    address: string
  }
}

export default async function EntityNetworkPage({ params }: EntityNetworkPageProps) {
  const { address } = params
  const entityData = await getEntityByAddress(address)
  const entity = entityData.entity

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Entity Network Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Entity Details</CardTitle>
            <CardDescription>Information about the selected entity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-sm text-muted-foreground break-all">{address}</p>
              </div>

              {entity ? (
                <>
                  <div>
                    <h3 className="font-medium">Label</h3>
                    <p>{entity.label}</p>
                  </div>

                  <div className="flex gap-2">
                    <div>
                      <h3 className="font-medium">Category</h3>
                      <Badge variant="outline" className="mt-1">
                        {entity.category}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-medium">Risk Score</h3>
                      <Badge
                        className="mt-1"
                        variant={
                          entity.riskScore && entity.riskScore >= 80
                            ? "destructive"
                            : entity.riskScore && entity.riskScore >= 60
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {entity.riskScore || "Unknown"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-medium">Source</h3>
                      <Badge variant="outline" className="mt-1">
                        {entity.source}
                      </Badge>
                    </div>
                  </div>

                  {entity.tags && entity.tags.length > 0 && (
                    <div>
                      <h3 className="font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entity.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entity.notes && (
                    <div>
                      <h3 className="font-medium">Notes</h3>
                      <p className="text-sm text-muted-foreground">{entity.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No entity information available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Profile</CardTitle>
            <CardDescription>Risk factors for this entity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Overall Risk Score</h3>
                <div className="mt-2 w-full bg-secondary rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      entityData.riskProfile.score >= 80
                        ? "bg-destructive"
                        : entityData.riskProfile.score >= 60
                          ? "bg-orange-500"
                          : entityData.riskProfile.score >= 40
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    }`}
                    style={{ width: `${entityData.riskProfile.score}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-right">{entityData.riskProfile.score}/100</p>
              </div>

              <div>
                <h3 className="font-medium">Risk Factors</h3>
                {entityData.riskProfile.factors.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {entityData.riskProfile.factors.map((factor, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span>{factor.factor}</span>
                        <Badge variant={factor.impact > 0 ? "destructive" : "secondary"} className="ml-2">
                          {factor.impact > 0 ? `+${factor.impact}` : factor.impact}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific risk factors identified</p>
                )}
              </div>

              <div>
                <h3 className="font-medium">Data Confidence</h3>
                <div className="mt-2 w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${entityData.confidence * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-right">{Math.round(entityData.confidence * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EntityNetworkGraph centralAddress={address} />
    </div>
  )
}
