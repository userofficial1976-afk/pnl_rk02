// =====================================================
// DASHBOARD
// FPB DUTY SYSTEM
// PAPAR POS SAHAJA
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataAnggota = [];



// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        console.log(
            "DASHBOARD BERJAYA DIMUAT"
        );


        if(!bacaPengguna()){

            return;

        }


        await muatDashboard();

    }
);



// =====================================================
// BACA PENGGUNA LOGIN
// =====================================================

function bacaPengguna(){

    const data =

        localStorage.getItem(
            "pengguna"
        )

        ||

        localStorage.getItem(
            "currentUser"
        );


    if(!data){

        alert(
            "Sila login terlebih dahulu"
        );


        window.location.href =
            "index.html";


        return false;

    }


    try{

        pengguna =
            JSON.parse(data);


        console.log(
            "PENGGUNA LOGIN:",
            pengguna
        );


        return true;

    }

    catch(error){

        console.error(
            "DATA PENGGUNA ROSAK:",
            error
        );


        localStorage.removeItem(
            "pengguna"
        );

        localStorage.removeItem(
            "currentUser"
        );


        window.location.href =
            "index.html";


        return false;

    }

}



// =====================================================
// MUAT DASHBOARD
// =====================================================

async function muatDashboard(){

    const pos =
        String(
            pengguna?.poskhidmat || ""
        ).trim();


    if(!pos){

        alert(
            "Pengguna tidak mempunyai Pos"
        );

        return;

    }


    console.log(
        "POS PENGGUNA:",
        pos
    );



    // =================================================
    // PAPAR POS
    // =================================================

    setText(
        "paparPos",
        pos
    );



    // =================================================
    // LOAD ANGGOTA POS
    // =================================================

    const {

        data,

        error

    } = await supabaseClient

        .from("Data_Anggota")

        .select(`
            noskb,
            noanggota,
            nama,
            pangkat,
            jawatan,
            poskhidmat,
            ketua_pos,
            ketua_unit
        `)

        .eq(
            "poskhidmat",
            pos
        )

        .order(
            "nama",
            {
                ascending: true
            }
        );



    if(error){

        console.error(
            "RALAT LOAD ANGGOTA:",
            error
        );


        setText(
            "jumlahAnggota",
            "GAGAL MEMUATKAN DATA"
        );


        return;

    }



    dataAnggota =
        data || [];



    console.log(
        "ANGGOTA POS:",
        dataAnggota
    );



    // =================================================
    // PAPAR KETUA
    // =================================================

    paparKetua();



    // =================================================
    // PAPAR SENARAI
    // =================================================

    paparSenaraiAnggota();

}



// =====================================================
// PAPAR KETUA UNIT / KETUA POS
// =====================================================

function paparKetua(){

    if(dataAnggota.length === 0){

        setText(
            "paparKetuaUnit",
            "-"
        );


        setText(
            "paparKetuaPos",
            pengguna?.nama || "-"
        );


        return;

    }



    // =================================================
    // KETUA UNIT
    // =================================================

    const ketuaUnit =
        dataAnggota.find(

            anggota =>

                String(
                    anggota.jawatan || ""
                )
                .toUpperCase()
                .includes(
                    "KETUA UNIT"
                )

        );



    // =================================================
    // KETUA POS
    // =================================================

    const ketuaPos =
        dataAnggota.find(

            anggota =>

                String(
                    anggota.jawatan || ""
                )
                .toUpperCase()
                .includes(
                    "KETUA POS"
                )

        );



    setText(

        "paparKetuaUnit",

        ketuaUnit?.nama || "-"

    );



    setText(

        "paparKetuaPos",

        ketuaPos?.nama

        ||

        pengguna?.nama

        ||

        "-"

    );

}



// =====================================================
// PAPAR SENARAI ANGGOTA
// =====================================================

function paparSenaraiAnggota(){

    const tbody =
        document.getElementById(
            "senaraiAnggota"
        );


    if(!tbody){

        return;

    }


    tbody.innerHTML = "";



    // =================================================
    // TIADA DATA
    // =================================================

    if(dataAnggota.length === 0){

        tbody.innerHTML = `

            <tr>

                <td colspan="6">

                    TIADA ANGGOTA UNTUK POS INI

                </td>

            </tr>

        `;


        setText(
            "jumlahAnggota",
            "0 ORANG"
        );


        return;

    }



    // =================================================
    // JUMLAH
    // =================================================

    setText(

        "jumlahAnggota",

        dataAnggota.length +
        " ORANG"

    );



    // =================================================
    // BINA ROW
    // =================================================

    dataAnggota.forEach(

        (anggota, index) => {


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        anggota.noskb
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        anggota.noanggota
                    )}
                </td>

                <td class="nama">
                    ${escapeHtml(
                        anggota.nama
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        anggota.pangkat
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        anggota.jawatan
                    )}
                </td>

            `;


            tbody.appendChild(tr);

        }

    );

}



// =====================================================
// SET TEXT
// =====================================================

function setText(
    id,
    nilai
){

    const element =
        document.getElementById(id);


    if(element){

        element.textContent =
            nilai ?? "-";

    }

}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
    nilai
){

    return String(
        nilai ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}



// =====================================================
// LOGOUT
// =====================================================

function logout(){

    localStorage.removeItem(
        "pengguna"
    );


    localStorage.removeItem(
        "currentUser"
    );


    window.location.href =
        "index.html";

}
