// =====================================================
// RK02-PNL-DATA-ENTRY.JS
// FPB DUTY COMMAND CENTER V2
// =====================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"RK02 PNL SYSTEM READY"
);



let pengguna = null;

let dataAnggota = [];



// =====================================================
// START
// =====================================================

mula();



async function mula(){


bacaPengguna();


await muatAnggota();


}



// =====================================================
// USER
// =====================================================


function bacaPengguna(){


pengguna =
JSON.parse(
localStorage.getItem("fpb_user")
);



/*
 JIKA TIADA LOGIN
 GUNA CONTOH KETUA POS
*/


if(!pengguna){


pengguna={


nama:
"KETUA POS F102-01",


jawatan:
"KETUA POS",


unit:
"JERANGAU",


pos:
"F102-01(SS)Kilang Sawit Jerangau"


};



localStorage.setItem(
"fpb_user",
JSON.stringify(pengguna)
);



}



console.log(
"PENGGUNA:",
pengguna
);



setText(
"namaPengguna",
pengguna.nama
);


setText(
"jawatanPengguna",
pengguna.jawatan
);


setText(
"paparPeranan",
pengguna.jawatan
);



}



// =====================================================
// LOAD ANGGOTA
// =====================================================


async function muatAnggota(){



try{


let query =
window.supabaseClient
.from("Data_Anggota")
.select(`

noskb,

wilayah,

kawasan,

pangkat,

nama,

poskhidmat,

unit,

jawatan,

ketua_pos,

ketua_unit,

rm_pehariklmbiasa,

rm_perharioffday,

rm_perjamoffday,

rm_perharicutiam,

rm_perjamcutiam

`);





// ===============================
// FILTER KETUA POS
// ===============================


if(
pengguna.jawatan === "KETUA POS"
){


query =
query.ilike(
"poskhidmat",
"%F102-01%"
);


}




// ===============================
// FILTER KETUA UNIT
// ===============================


if(
pengguna.jawatan === "KETUA UNIT"
){


query =
query.eq(
"unit",
pengguna.unit
);


}




const {

data,

error

}

=
await query
.order(
"nama"
);





if(error)
throw error;





console.log(
"DATA ANGGOTA FILTER:",
data
);




dataAnggota =
data || [];




paparAnggota();





}

catch(err){


console.error(
err
);


alert(
"Gagal membaca Data_Anggota"
);



}



}





// =====================================================
// PAPAR TABLE
// =====================================================


function paparAnggota(){


const tbody =
document.getElementById(
"rk02TableBody"
);



if(!tbody)
return;



tbody.innerHTML="";




dataAnggota.forEach(
(
a,
i
)=>{



tbody.innerHTML += `


<tr>


<td>
${i+1}
</td>


<td class="skb-cell">
${a.noskb ?? ""}
</td>


<td class="name-cell">

${a.nama ?? ""}

<br>

<small>
${a.pangkat ?? ""}
</small>

</td>



<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>


<td>
<input type="number" value="0">
</td>



<td class="total-cell">

0

</td>



<td class="total-cell">

RM 0.00

</td>



</tr>


`;



});




setText(
"bilanganAnggota",
dataAnggota.length
);



setText(
"summaryAnggota",
dataAnggota.length+" ORANG"
);



}






// =====================================================
// HELPER
// =====================================================


function setText(
id,
value
){


const el =
document.getElementById(id);



if(el)
el.textContent=value;



}



});

/* =====================================================
   POS TAMPUNGAN INPUT
===================================================== */


.pos-select{

width:150px;

height:38px;

border:1px solid #d5e1e2;

border-radius:9px;

padding:0 8px;

font-size:12px;

font-weight:700;

color:#24474b;

}



.pos-input{

width:75px!important;

height:37px;

text-align:center;

}


.pos-input:focus,

.pos-select:focus{

border-color:#247b83;

box-shadow:

0 0 0 3px

rgba(36,123,131,.10);

}
