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



let pengguna = null;

let dataAnggota = [];



// =====================================================
// START SYSTEM
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


pengguna = {

nama:"ADMIN FPB",

jawatan:"ADMIN",

unit:"",

pos:""

};


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
// LOAD DATA ANGGOTA
// =====================================================


async function muatAnggota(){


try{


let query =
window.supabaseClient
.from(
"Data_Anggota"
)
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





// =====================================================
// FILTER AKSES
// =====================================================


// ADMIN
// semua data


if(
pengguna.jawatan === "KETUA UNIT"
&&
pengguna.unit
){


query =
query.eq(
"unit",
pengguna.unit
);


}





if(
pengguna.jawatan === "KETUA POS"
&&
pengguna.pos
){


query =
query.eq(
"poskhidmat",
pengguna.pos
);


}





// =====================================================
// RUN QUERY
// =====================================================


const {

data,

error

}

=
await query
.order(
"nama"
);



if(error){

throw error;

}



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
"ERROR DATA ANGGOTA:",
err
);


alert(
"Gagal membaca Data_Anggota"
);



}



}




// =====================================================
// PAPAR TABLE RK02
// =====================================================


function paparAnggota(){



const tbody =
document.getElementById(
"rk02TableBody"
);



if(!tbody)
return;



tbody.innerHTML = "";



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




// jumlah anggota


setText(
"bilanganAnggota",
dataAnggota.length
);



setText(
"summaryAnggota",
dataAnggota.length + " ORANG"
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
document.getElementById(
id
);



if(el){

el.textContent = value;

}



}



});
