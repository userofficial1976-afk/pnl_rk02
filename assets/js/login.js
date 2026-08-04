async function login(){


const no_skb =
document.getElementById(
"no_skb"
).value;


const password =
document.getElementById(
"password"
).value;



const {

data,

error

}= await supabaseClient

.from("pengguna")

.select("*")

.eq(
"no_skb",
no_skb
)

.eq(
"password",
password
)

.single();



if(error || !data){


alert(
"Login gagal"
);


return;


}



// simpan pengguna


localStorage.setItem(

"pengguna",

JSON.stringify(data)

);



console.log(
"LOGIN:",
data
);




// semak jawatan


if(
data.jawatan==="KETUA POS"
){


window.location.href=

"rk02-pnl-data-entry.html";


}

else{


alert(
"Akses belum dibuka"
);


}



}
