// Returns the Stripe publishable key for client-side initialization
export default async (req) => {
  const key = Netlify.env.get('STRIPE_PUBLISHABLE_KEY') || '';
  return Response.json({ publishableKey: key });
};

export const config = {
  path: '/api/stripe-config',
  method: 'GET',
};
