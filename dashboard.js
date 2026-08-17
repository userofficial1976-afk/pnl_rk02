// =====================================================
// DASHBOARD
// FPB DUTY COMMAND CENTER
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
            "DASHBOARD SYSTEM READY"
        );


        await mulaDashboard();

    }
);



// =====================================================
// MULA DASHBOARD
// =====================================================

async function mulaDashboard(){

    try{

        // ================================
        // BACA PENGGUNA
        // ================================

        bacaPengguna();


        if(!pengguna){

            return;

        }


        // ================================
        // PAPAR PENGGUNA
        // ================================

        paparMaklumatPengguna();


        // ================================
        // LOAD ANGGOTA MENGIKUT POS
        // ================================

        await muatAnggotaPos();


        console.log(
            "DASHBOARD BERJAYA DIMUAT"
        );

    }

    catch(error){

        console.error(
            "RALAT DASHBOARD:",
            error
        );


        paparRalat(
            "Sistem gagal memuatkan Dashboard."
        );

    }

}



// =====================================================
// BACA PENGGUNA LOGIN
// =====================================================

function bacaPengguna(){

    const data =
        localStorage.getItem("pengguna")
        ||
        localStorage.getItem("currentUser");


    if(!data){

        console.warn(
            "TIADA DATA PENGGUNA"
        );


        paparRalat(
            "Tiada pengguna login."
        );


        return;

    }


    try{

        pengguna =
            JSON.parse(data);


        console.log(
            "PENGGUNA LOGIN:",
            pengguna
        );

    }

    catch(error){

        console.error(
            "DATA PENGGUNA ROSAK:",
            error
        );


        pengguna = null;


        paparRalat(
            "Data pengguna tidak sah."
        );

    }

}



// =====================================================
// PAPAR MAKLUMAT PENGGUNA
// =====================================================

function paparMaklumatPengguna(){

    const pos =
        pengguna?.poskhidmat
        ||
        "-";


    const unit =
        pengguna?.unit
        ||
        "-";


    const nama =
        pengguna?.nama
        ||
        "-";


    const jawatan =
        pengguna?.jawatan
        ||
        "-";


    setText(
        "paparPos",
        pos
    );


    setText(
        "paparUnit",
        unit
    );


    setText(
        "namaPengguna",
        nama
    );


    setText(
        "jawatanPengguna",
        jawatan
    );

}



// =====================================================
// LOAD ANGGOTA MENGIKUT POS SAHAJA
// TABLE: Data_Anggota
// =====================================================

async function muatAnggotaPos(){

    const pos =
        pengguna?.poskhidmat
        ||
        "";


    if(!pos){

        console.warn(
            "PENGGUNA TIADA POS"
        );


        paparRalat(
            "Pengguna tidak mempunyai POS."
        );


        return;

    }


    console.log(
        "LOAD ANGGOTA POS:",
        pos
    );


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
            status,
            poskhidmat,
            unit,
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


        paparRalat(
            "Gagal mendapatkan data anggota."
        );


        return;

    }


    dataAnggota =
        data || [];


    console.log(
        "JUMLAH ANGGOTA:",
        dataAnggota.length
    );


    // =====================================
    // AMBIL MAKLUMAT KETUA
    // =====================================

    paparKetua(dataAnggota);


    // =====================================
    // PAPAR TABLE
    // =====================================

    paparSenaraiAnggota();

}



// =====================================================
// PAPAR KETUA UNIT / KETUA POS
// =====================================================

function paparKetua(data){

    if(!data.length){

        setText(
            "paparKetuaUnit",
            "-"
        );


        setText(
            "paparKetuaPos",
            "-"
        );


        return;

    }


    // =====================================
    // KETUA UNIT
    // =====================================

    const ketuaUnit =
        data.find(
            item =>
                item.ketua_unit
        )?.ketua_unit
        ||
        "-";


    // =====================================
    // KETUA POS
    // =====================================

    const ketuaPos =
        data.find(
            item =>
                item.ketua_pos
        )?.ketua_pos
        ||
        "-";


    setText(
        "paparKetuaUnit",
        ketuaUnit
    );


    setText(
        "paparKetuaPos",
        ketuaPos
    );

}



// =====================================================
// PAPAR SENARAI ANGGOTA
// =====================================================

function paparSenaraiAnggota(){

    const tbody =
        document.getElementById(
            "anggotaTableBody"
        );


    if(!tbody){

        return;

    }


    tbody.innerHTML = "";


    // =====================================
    // JUMLAH
    // =====================================

    setText(
        "jumlahAnggota",
        dataAnggota.length +
        " ORANG"
    );


    // =====================================
    // TIADA DATA
    // =====================================

    if(dataAnggota.length === 0){

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-cell"
                >

                    TIADA ANGGOTA
                    BERDAFTAR DI POS INI

                </td>

            </tr>

        `;

        return;

    }


    // =====================================
    // PAPAR DATA
    // =====================================

    dataAnggota.forEach(
        (anggota, index) => {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

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


                <td>
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


                <td>
                    ${escapeHtml(
                        anggota.status
                    )}
                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}



// =====================================================
// LOG KELUAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        document
            .getElementById("btnLogout")
            ?.addEventListener(
                "click",
                function(){

                    localStorage.removeItem(
                        "pengguna"
                    );

                    localStorage.removeItem(
                        "currentUser"
                    );


                    window.location.href =
                        "index.html";

                }
            );

    }
);



// =====================================================
// SET TEXT
// =====================================================

function setText(
    id,
    nilai
){

    const element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            nilai
            ??
            "-";

    }

}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(teks){

    return String(
        teks ?? ""
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
// PAPAR RALAT
// =====================================================

function paparRalat(
    mesej
){

    const tbody =
        document.getElementById(
            "anggotaTableBody"
        );


    if(tbody){

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-cell"
                >

                    ${escapeHtml(
                        mesej
                    )}

                </td>

            </tr>

        `;

    }

}
