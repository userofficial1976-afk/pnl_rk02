// =====================================================
// LOGIN.JS
// =====================================================

async function login() {


const no_skb = document
    .getElementById("no_skb")
    .value
    .trim();

const password = document
    .getElementById("password")
    .value
    .trim();


// SEMAK INPUT

if (no_skb === "" || password === "") {

    alert("Sila masukkan No. SKB dan kata laluan");

    return;

}


// LOGIN SUPABASE

const response = await supabaseClient

    .from("pengguna")

    .select("*")

    .eq("no_skb", no_skb)

    .eq("password", password)

    .maybeSingle();


// SEMAK RALAT

if (response.error) {

    console.error(

        "RALAT LOGIN:",

        response.error

    );

    alert(

        "Ralat semasa proses login"

    );

    return;

}


// SEMAK PENGGUNA

if (!response.data) {

    alert(

        "No. SKB atau kata laluan tidak sah"

    );

    return;

}


// DATA PENGGUNA

const pengguna = response.data;


console.log(

    "LOGIN BERJAYA:",

    pengguna

);


// SEMAK STATUS

const status = String(

    pengguna.status || ""

)

.trim()

.toUpperCase();


if (

    status !== ""

    &&

    status !== "AKTIF"

) {

    alert(

        "Akaun pengguna tidak aktif"

    );

    return;

}


// SIMPAN LOGIN

localStorage.setItem(

    "pengguna",

    JSON.stringify(

        pengguna

    )

);


localStorage.setItem(

    "currentUser",

    JSON.stringify(

        pengguna

    )

);


// NORMALKAN JAWATAN

const jawatan = String(

    pengguna.jawatan || ""

)

.trim()

.toUpperCase();


console.log(

    "JAWATAN:",

    jawatan

);


// AKSES SISTEM

if (

    jawatan === "KETUA POS"

    ||

    jawatan === "KETUA UNIT"

    ||

    jawatan === "ADMIN"

) {

    window.location.href =

    "rk02-pnl-data-entry.html";

    return;

}


// JAWATAN TIDAK DIBENARKAN

alert(

    "Akses belum dibuka. Jawatan: " +

    (

        jawatan || "TIADA"

    )

);
```

}
