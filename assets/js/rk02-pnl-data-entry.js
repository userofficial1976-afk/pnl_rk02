// =====================================================
// RK02-PNL-DATA-ENTRY.JS
// FPB DUTY COMMAND CENTER V2
//
// FUNGSI:
// 1. Baca pengguna login
// 2. Kawalan akses
// 3. Ambil anggota Data_Anggota
// 4. Papar jadual RK02
// =====================================================


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"RK02 PNL DATA ENTRY READY"
);


// =====================================================
// SUPABASE
// =====================================================

const db = window.supabaseClient;


// =====================================================
// GLOBAL DATA
// =====================================================

let pengguna = null;

let senaraiAnggota = [];



// =====================================================
// START SYSTEM
// =====================================================

mulaRK02();



async function mulaRK02(){


await bacaPengguna();


await kawalanAkses();


await muatAnggota();


}



// =====================================================
// BACA LOGIN USER
// =====================================================

async function bacaPengguna(){


/*
CONTOH DATA LOGIN

{
 nama:"AHMAD",
 jawatan:"KETUA POS",
 unit:"JERANGAU",
 pos:"F102-01"
}

*/


pengguna =
JSON.parse(
localStorage.getItem(
"fpb_user"
)
);



if(!pengguna){


pengguna={

nama:"PENGGUNA DEMO",

jawatan:"KETUA POS",

unit:"JERANGAU",

pos:"F102-01"

};


}



document
.getElementById(
"namaPengguna"
)
.textContent =
pengguna.nama;



document
.getElementById(
"jawatanPengguna"
)
.textContent =
pengguna.jawatan;



document
.getElementById(
"paparPeranan"
)
.textContent =
pengguna.jawatan;



console.log(
"USER:",
pengguna
);



}



// =====================================================
// KAWALAN AKSES
// =====================================================

async function kawalanAkses(){



let unit =
document.getElementById(
"unit"
);


let pos =
document.getElementById(
"poskhidmat"
);



if(
pengguna.jawatan === "KETUA POS"
){


unit.disabled=true;

pos.disabled=true;


unit.innerHTML =
`
<option>
${pengguna.unit}
</option>
`;



pos.innerHTML =
`
<option>
${pengguna.pos}
</option>
`;



}




else if(
pengguna.jawatan === "KETUA UNIT"
){


unit.disabled=true;

pos.disabled=false;



unit.innerHTML =
`
<option>
${pengguna.unit}
</option>
`;



console.log(
"KETUA UNIT ACCESS"
);



}




else{


unit.disabled=false;

pos.disabled=false;



console.log(
"ADMIN ACCESS"
);



}




}



// =====================================================
// MUAT ANGGOTA
// =====================================================


async function muatAnggota(){


try{


const {

data,
error

}=await db

.from(
"Data_Anggota"
)

.select(
`
no_skb,
nama,
pos,
unit,
status
`
)


.eq(
"status",
"Aktif"
)



if(error)
throw error;



senaraiAnggota=data;



paparAnggota();



}

catch(e){


console.error(
e
);


alert(
"Gagal ambil data anggota"
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



senaraiAnggota
.forEach(
(anggota,index)=>{


tbody.innerHTML +=

`

<tr>


<td>
${index+1}
</td>


<td class="skb-cell">
${anggota.no_skb}
</td>


<td class="name-cell">
${anggota.nama}
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



}

);



document
.getElementById(
"bilanganAnggota"
)
.textContent =
senaraiAnggota.length;



document
.getElementById(
"summaryAnggota"
)
.textContent =
`${senaraiAnggota.length} ORANG`;



}



});
