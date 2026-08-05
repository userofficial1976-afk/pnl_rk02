// =====================================================
// LOGIN.JS
// =====================================================

async function login() {

```
const no_skb = document.getElementById("no_skb").value.trim();

const password = document.getElementById("password").value.trim();


if (no_skb === "" || password === "") {

    alert("Sila masukkan No. SKB dan kata laluan");

    return;

}


const result = await supabaseClient
    .from("pengguna")
    .select("*")
    .eq("no_skb", no_skb)
    .eq("password", password)
    .maybeSingle();


const data = result.data;

const error = result.error;


if (error) {

    console.error("RALAT LOGIN:", error);

    alert("Ralat sambungan sistem");

    return;

}


if (!data) {

    alert("No. SKB atau kata laluan tidak sah");

    return;

}


console.log("LOGIN BERJAYA:", data);


localStorage.setItem(

    "pengguna",

    JSON.stringify(data)

);


localStorage.setItem(

    "currentUser",

    JSON.stringify(data)

);


const jawatan = String(

    data.jawatan ||

    data.peranan ||

    ""

).trim().toUpperCase();


console.log(

    "JAWATAN LOGIN:",

    jawatan

);


const aksesDibenarkan =

    jawatan.includes("KETUA POS")

    ||

    jawatan.includes("KETUA UNIT")

    ||

    jawatan.includes("ADMIN");


if (!aksesDibenarkan) {

    alert(

        "Akses belum dibuka. Jawatan: " +

        (jawatan || "TIADA")

    );

    return;

}


window.location.href =

"rk02-pnl-data-entry.html";
```

}
