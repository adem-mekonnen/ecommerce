// get dashboard data for seller (total orders,total rating , total products)
export async function GET(request) {
  try {
    // Authenticate
    const { userId } = getAuth(request);
    const storeId = await getUserStoreId(userId);
    // get all orders for sellers

   const orders = await prisma.order.findMany({
     where: {
       storeId
     },
   });
    const totalOrders = orders.length;

    // Get all product for ratings
    const products =  await prisma.product.findMany({
      where: {
        storeId
      },
    });
    const totalProducts = products.length;
  const ratings =  await prisma.rating.findMany({
    where: {
      productId: { in: products.map((p) => p.id) },
      include : { user : true , product : true

    },
  }});
   const dashboardData = {
    ratings,
    totalOrders : orders.length,
    totoalEarnings : Math.round(orders.reduce((acc, order) => acc + order.totalAmount, 0)),
     totalProducts : products.length,
   };
   return NextResponse.json({ ok: true, dashboardData }, { status: 200 });
  }
  catch (err) {
    console.error("/api/store/dashboard GET error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}