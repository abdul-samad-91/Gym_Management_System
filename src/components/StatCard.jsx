export default function StatCard({ title, value, icon: Icon, color = 'primary', trend }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card hover:shadow-md transition-shadow w-56 ">
      <div className="flex  flex-col w-32 h-32 gap-4 ">
         {Icon && (
          <div className={`p-3 rounded-lg  w-12 h-12 ${colorClasses[color]} `}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 ">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
              <span className="text-gray-500 ml-1">{trend.label}</span>
            </p>
          )}
        </div>
       
      </div>
    </div>
  );
}




