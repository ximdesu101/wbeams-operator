import SelectAlerts from './layout/SelectAlerts'
import RecentDispatched from './layout/RecentDispatched'

const Compose = () => {
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <SelectAlerts />
            </div>

            <div className="space-y-4">
                <RecentDispatched />
            </div>
        </div>
    )
}

export default Compose