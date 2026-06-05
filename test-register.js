

async function test() {
  try {
    const res = await fetch("https://osta.vercel.app/api/auth/register/worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "Worker",
        phone: "01000000000" + Math.floor(Math.random() * 1000), // Random phone
        password: "password123",
        confirmPassword: "password123",
        nationalIdNumber: "2900101123456" + Math.floor(Math.random() * 10), // Random ID
        nationalIdFront: "dummy_url",
        nationalIdBack: "dummy_url",
        profession: "سباك",
        acceptedTerms: true
      })
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}

test();
