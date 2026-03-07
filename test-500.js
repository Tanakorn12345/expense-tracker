async function testFetchMe() {
    try {
        console.log("Registering a test user...");
        const registerRes = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "test500@example.com",
                password: "password123",
                name: "Test User"
            })
        });

        const registerData = await registerRes.json();
        console.log("Register status:", registerRes.status);
        console.log("Register data:", registerData);

        let token = registerData.token;
        if (!token) {
            // maybe already exists? Try login
            console.log("Register failed, trying login...");
            const loginRes = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test500@example.com", password: "password123" })
            });
            const loginData = await loginRes.json();
            token = loginData.token;
        }

        console.log("Fetching /me with Bearer token...");
        const meRes = await fetch("http://localhost:3000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Me status:", meRes.status);
        console.log("Me data:", await meRes.json());
    } catch (e) {
        console.error("Error:", e);
    }
}

testFetchMe();
