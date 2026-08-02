// =====================================================
// RK02-PNL-DATA-ENTRY.JS
// FPB DUTY COMMAND CENTER V2
//
// FASA 1:
// - Login user
// - Kawalan akses
// - Load Data_Anggota
// - Papar anggota RK02
// =====================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"RK02 PNL SYSTEM READY"
);


const db =
window.supabaseClient;


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
// USER LOGIN
// =====================================================

function bacaPengguna(){


pengguna =
JSON.parse(
localStorage.getItem(
"fpb_user"
)
);



if(!pengguna){


pengguna={

nama:"ADMIN FPB",

jawatan:"ADMIN",

unit:"",
pos:""

};


}



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
db

.from("Data_Anggota")

.select(`

noskb,
nama,
pangkat,
poskhidmat,
unit,
jawatan,
ketua_pos,
ketua_unit,
status,

rm_pehariklmbiasa,
rm_perharioffday,
rm_perjamoffday,
rm_perharicutiam,
rm_perjamcutiam

`)

.eq(
"status",
"AKTIF"
);





// ================================
// KETUA POS
// ================================


if(
pengguna.jawatan
===
"KETUA POS"
){


query =
query.eq(
"poskhidmat",
pengguna.pos
);


}



// ================================
// KETUA UNIT
// ================================


if(
pengguna.jawatan
===
"KETUA UNIT"
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
await query;



if(error)
throw error;



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
${a.noskb}
</td>


<td class="name-cell">

${a.nama}

<br>

<small>
${a.pangkat || ""}
</small>

</td>



<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
</td>


<td>
<input type="number" min="0" value="0">
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
`${dataAnggota.length} ORANG`
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
