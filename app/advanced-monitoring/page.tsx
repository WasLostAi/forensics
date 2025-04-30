import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ICOMonitoring } from "@/components/ico-monitoring"
import { RugPullMonitoring } from "@/components/rugpull-monitoring"
import { MixerMonitoring } from "@/components/mixer-monitoring"
import { SniperMonitoring } from "@/components/sniper-monitoring"
import { AlertCenter } from "@/components/alert-center"

export default function AdvancedMonitoringPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor and analyze high-risk activities on Solana including X-ICOs, rug pulls, mixers, and sniper bots.
        </p>
      </div>

      <AlertCenter />

      <Tabs defaultValue="ico" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="ico">X-ICO Monitoring</TabsTrigger>
          <TabsTrigger value="rugpull">Rug Pull Detection</TabsTrigger>
          <TabsTrigger value="mixer">Mixer Analysis</TabsTrigger>
          <TabsTrigger value="sniper">Sniper Tracking</TabsTrigger>
        </TabsList>
        <TabsContent value="ico">
          <ICOMonitoring />
        </TabsContent>
        <TabsContent value="rugpull">
          <RugPullMonitoring />
        </TabsContent>
        <TabsContent value="mixer">
          <MixerMonitoring />
        </TabsContent>
        <TabsContent value="sniper">
          <SniperMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  )
}
