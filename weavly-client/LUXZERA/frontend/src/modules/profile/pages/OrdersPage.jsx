export default function OrdersPage() {
	return (
		<div className="max-w-7xl mx-auto px-6 py-16">
			<h1 className="text-5xl font-black uppercase tracking-tight text-[#0b2240]">
				My Orders
			</h1>

			<p className="mt-4 text-slate-600">
				Review your past and upcoming orders.
			</p>

			<div className="mt-12 border border-slate-200 rounded-2xl p-6 bg-white">
				<p className="text-sm text-slate-500">
					No orders yet. Your order history will appear here once you place an order.
				</p>
			</div>
		</div>
	);
}
