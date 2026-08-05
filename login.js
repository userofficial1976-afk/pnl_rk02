async function login(){

```
const no_skb =

document
.getElementById(
    "no_skb"
)
.value
.trim();


const password =

document
.getElementById(
    "password"
)
.value
.trim();


// =====================================================
// SEMAK INPUT
// =====================================================

if(

    !no_skb

    ||

    !password

){

    alert(
        "Sila masukkan No. SKB dan kata laluan"
    );

    return;

}


// =====================================================
// LOGIN SUPABASE
// =====================================================

const {

    data,

    error

} = await supabaseClient

.from(
    "pengguna"
)

.select(
    "*"
)

.eq(
    "no_skb",
    no_skb
)

.eq(
    "password",
    password
)

.maybeSingle();


// =====================================================
// SEMAK RALAT
// =====================================================

if(error){

    console.error(
        "RALAT LOGIN:",
        error
    );

    alert(
        "Ralat semasa proses login"
    );

    return;

}


// =====================================================
// DATA TIDAK DIJUMPAI
// =====================================================

if(!data){

    alert(
        "No. SKB atau kata laluan tidak sah"
    );

    return;

}


// =====================================================
// PAPAR LOG
// =====================================================

console.log(
    "LOGIN BERJAYA:",
    data
);


// =====================================================
// SIMPAN PENGGUNA
// =====================================================

localStorage.setItem(

    "pengguna",

    JSON.stringify(
        data
    )

);


localStorage.setItem(

    "currentUser",

    JSON.stringify(
        data
    )

);


// =====================================================
// NORMALKAN JAWATAN
// =====================================================

const jawatan =

String(

    data.jawatan

    ||

    data.peranan

    ||

    ""

)

.trim()

.toUpperCase();


console.log(
    "JAWATAN LOGIN:",
    jawatan
);


// =====================================================
// SEMAK AKSES
// =====================================================

const aksesDibenarkan =

    jawatan.includes(
        "KETUA POS"
    )

    ||

    jawatan.includes(
        "KETUA UNIT"
    )

    ||

    jawatan.includes(
        "ADMIN"
    );


if(

    !aksesDibenarkan

){

    alert(
        "Akses belum dibuka"
    );

    return;

}


// =====================================================
// BUKA RK02 & PNL
// =====================================================

window.location.href =

"rk02-pnl-data-entry.html";
```

}
