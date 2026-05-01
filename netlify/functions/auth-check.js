exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ authorized: false, reason: "No email provided" })
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    // ADMIN ACCESS
    if (cleanEmail === "awaken@consultant.com") {
      return {
        statusCode: 200,
        body: JSON.stringify({ authorized: true, role: "admin" })
      };
    }

    // TEMP SUBSCRIBER LOGIC (until Shopify/ReCharge is connected)
    // Replace this later with real subscription validation
    const allowedSubscribers = [
      // Add test subscriber emails here if needed
    ];

    if (allowedSubscribers.includes(cleanEmail)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ authorized: true, role: "subscriber" })
      };
    }

    // DEFAULT: LOCKED
    return {
      statusCode: 200,
      body: JSON.stringify({ authorized: false, reason: "No active subscription" })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ authorized: false, error: "Server error" })
    };
  }
};
