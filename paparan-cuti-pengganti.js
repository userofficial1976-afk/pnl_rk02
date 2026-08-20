// =====================================================
// PAPARAN CUTI PENGGANTI
// FPB DUTY COMMAND CENTER V2
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataCuti = [];


// =====================================================
// BULAN
// =====================================================

const SENARAI_BULAN = [

    "",
    "Januari",
    "Februari",
    "Mac",
    "April",
    "Mei",
    "Jun",
    "Julai",
    "Ogos",
    "September",
    "Oktober",
    "November",
    "Disember"

];


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        console.log(
            "PAPARAN CUTI PENGGANTI START"
        );


        await tungguPengguna();


        if(!pengguna){

            return;

        }


        paparMaklumatPengguna();

        tetapkanTarikhSemasa();

        pasangEvent();

    }
);


// =====================================================
// TUNGGU PENGGUNA
// =====================================================

async function tungguPengguna(){

    for(
        let i = 0;
        i < 50;
        i++
    ){

        if(
            window.pengguna ||
            window.currentUser ||
            window.user
        ){

            pengguna =
                window.pengguna ||
                window.currentUser ||
                window.user;

            return;

        }


        const localUser =
            localStorage.getItem(
                "pengguna"
            );


        if(localUser){

            try{

                pengguna =
                    JSON.parse(
                        localUser
                    );

                return;

            }

            catch(error){

                console.error(
                    "RALAT USER:",
                    error
                );

            }

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );

    }


    pengguna =
        window.pengguna ||
        window.currentUser ||
        window.user ||
        null;

}



// =====================================================
// PAPAR USER
// =====================================================

function paparMaklumatPengguna(){

    setText(
        "namaPengguna",
        pengguna?.nama ||
        "-"
    );


    setText(
        "jawatanPengguna",
        pengguna?.jawatan ||
        "-"
    );


    const pos =
        pengguna?.poskhidmat ||
        "-";


    setText(
        "poskhidmat",
        pos
    );


    setText(
        "heroPos",
        pos
    );


    setText(
        "reportBadge",
        pos
    );


    setText(
        "avatarPengguna",
        binaAvatar(
            pengguna?.nama
        )
    );

}



// =====================================================
// TARIKH
// =====================================================

function tetapkanTarikhSemasa(){

    const sekarang =
        new Date();


    const bulan =
        sekarang.getMonth() + 1;


    const tahun =
        sekarang.getFullYear();


    const bulanEl =
        document.getElementById(
            "bulan"
        );


    const tahunEl =
        document.getElementById(
            "tahun"
        );


    if(bulanEl){

        bulanEl.value =
            String(bulan);

    }


    if(tahunEl){

        tahunEl.value =
            String(tahun);

    }

}



// =====================================================
// EVENT
// =====================================================

function pasangEvent(){

    document
        .getElementById("btnPapar")
        ?.addEventListener(
            "click",
            paparCuti
        );


    document
        .getElementById("btnCetak")
        ?.addEventListener(
            "click",
            cetakLaporan
        );

}



// =====================================================
// PAPAR CUTI
// =====================================================

async function paparCuti(){

    const bulan =
        Number(
            document.getElementById(
                "bulan"
            )?.value
        );


    const tahun =
        Number(
            document.getElementById(
                "tahun"
            )?.value
        );


    const poskhidmat =
        String(
            pengguna?.poskhidmat ||
            ""
        ).trim();


    if(
        !bulan ||
        !tahun
    ){

        alert(
            "Sila pilih bulan dan tahun."
        );

        return;

    }


    if(!poskhidmat){

        alert(
            "POS KHIDMAT pengguna tidak dijumpai."
        );

        return;

    }


    setStatus(
        "Sedang mengambil data cuti pengganti..."
    );


    try{

        const {
            data,
            error
        } =
            await supabaseClient

                .from(
                    "cuti_pengganti"
                )

                .select("*")

                .eq(
                    "bulan",
                    bulan
                )

                .eq(
                    "tahun",
                    tahun
                )

                .eq(
                    "poskhidmat",
                    poskhidmat
                )

                .order(
                    "no_skb",
                    {
                        ascending:true
                    }
                );


        if(error){

            throw error;

        }


        dataCuti =
            data ||
            [];


        paparTable(
            dataCuti,
            bulan,
            tahun,
            poskhidmat
        );


        paparSummary(
            dataCuti,
            bulan,
            tahun,
            poskhidmat
        );


        setStatus(
            dataCuti.length +
            " rekod berjaya dipaparkan."
        );


        console.log(
            "DATA CUTI PENGGANTI:",
            dataCuti
        );

    }

    catch(error){

        console.error(
            "RALAT CUTI PENGGANTI:",
            error
        );


        dataCuti = [];


        setStatus(
            "Gagal mengambil data."
        );


        alert(
            "Gagal mengambil data cuti pengganti:\n" +
            error.message
        );

    }

}



// =====================================================
// PAPAR TABLE
// =====================================================

function paparTable(
    rows,
    bulan,
    tahun,
    poskhidmat
){

    const tbody =
        document.getElementById(
            "cutiTableBody"
        );


    if(!tbody){

        return;

    }


    tbody.innerHTML = "";


    if(
        !rows ||
        rows.length === 0
    ){

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="19"
                    class="empty-row"
                >
                    TIADA REKOD CUTI PENGGANTI
                    UNTUK POS INI
                </td>

            </tr>

        `;


        paparJumlah([]);


        return;

    }


    rows.forEach(
        (r,index) => {

            const jumlahJam =

                nombor(
                    r.jam_cuti_tahun
                )

                +

                nombor(
                    r.jam_kursus
                )

                +

                nombor(
                    r.jam_cuti_sakit
                )

                +

                nombor(
                    r.jam_cuti_ehsan
                )

                +

                nombor(
                    r.jam_cuti_ganti
                )

                +

                nombor(
                    r.jam_lain1
                )

                +

                nombor(
                    r.jam_lain2
                );


            const jumlahRM =

                nombor(
                    r.rm_cuti_tahun
                )

                +

                nombor(
                    r.rm_kursus
                )

                +

                nombor(
                    r.rm_cuti_sakit
                )

                +

                nombor(
                    r.rm_cuti_ehsan
                )

                +

                nombor(
                    r.rm_cuti_ganti
                )

                +

                nombor(
                    r.rm_lain1
                )

                +

                nombor(
                    r.rm_lain2
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    ${esc(r.no_skb)}
                </td>


                <td class="nama-cell">
                    ${esc(r.nama)}
                </td>


                <td>
                    ${num(r.jam_cuti_tahun)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_cuti_tahun)}
                </td>


                <td>
                    ${num(r.jam_kursus)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_kursus)}
                </td>


                <td>
                    ${num(r.jam_cuti_sakit)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_cuti_sakit)}
                </td>


                <td>
                    ${num(r.jam_cuti_ehsan)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_cuti_ehsan)}
                </td>


                <td>
                    ${num(r.jam_cuti_ganti)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_cuti_ganti)}
                </td>


                <td>
                    ${num(r.jam_lain1)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_lain1)}
                </td>


                <td>
                    ${num(r.jam_lain2)}
                </td>

                <td class="money-cell">
                    ${rm(r.rm_lain2)}
                </td>


                <td class="money-cell">
                    ${num(jumlahJam)}
                </td>

                <td class="money-cell">
                    RM ${rm(jumlahRM)}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );


    paparJumlah(
        rows
    );



    setText(
        "reportSubtitle",
        `${SENARAI_BULAN[bulan]} ${tahun} — ${poskhidmat}`
    );

}



// =====================================================
// JUMLAH
// =====================================================

function paparJumlah(
    rows
){

    const jumlah = {

        jam_cuti_tahun:0,
        rm_cuti_tahun:0,

        jam_kursus:0,
        rm_kursus:0,

        jam_cuti_sakit:0,
        rm_cuti_sakit:0,

        jam_cuti_ehsan:0,
        rm_cuti_ehsan:0,

        jam_cuti_ganti:0,
        rm_cuti_ganti:0,

        jam_lain1:0,
        rm_lain1:0,

        jam_lain2:0,
        rm_lain2:0

    };


    rows.forEach(
        r => {

            Object.keys(jumlah)
                .forEach(
                    key => {

                        jumlah[key] +=
                            nombor(
                                r[key]
                            );

                    }
                );

        }
    );


    const totalJam =

        jumlah.jam_cuti_tahun +

        jumlah.jam_kursus +

        jumlah.jam_cuti_sakit +

        jumlah.jam_cuti_ehsan +

        jumlah.jam_cuti_ganti +

        jumlah.jam_lain1 +

        jumlah.jam_lain2;


    const totalRM =

        jumlah.rm_cuti_tahun +

        jumlah.rm_kursus +

        jumlah.rm_cuti_sakit +

        jumlah.rm_cuti_ehsan +

        jumlah.rm_cuti_ganti +

        jumlah.rm_lain1 +

        jumlah.rm_lain2;



    setText(
        "totalCutiTahunJam",
        num(jumlah.jam_cuti_tahun)
    );


    setText(
        "totalCutiTahunRM",
        "RM " +
        rm(jumlah.rm_cuti_tahun)
    );


    setText(
        "totalKursusJam",
        num(jumlah.jam_kursus)
    );


    setText(
        "totalKursusRM",
        "RM " +
        rm(jumlah.rm_kursus)
    );


    setText(
        "totalMCJam",
        num(jumlah.jam_cuti_sakit)
    );


    setText(
        "totalMCRM",
        "RM " +
        rm(jumlah.rm_cuti_sakit)
    );


    setText(
        "totalEhsanJam",
        num(jumlah.jam_cuti_ehsan)
    );


    setText(
        "totalEhsanRM",
        "RM " +
        rm(jumlah.rm_cuti_ehsan)
    );


    setText(
        "totalGantiJam",
        num(jumlah.jam_cuti_ganti)
    );


    setText(
        "totalGantiRM",
        "RM " +
        rm(jumlah.rm_cuti_ganti)
    );


    setText(
        "totalLain1Jam",
        num(jumlah.jam_lain1)
    );


    setText(
        "totalLain1RM",
        "RM " +
        rm(jumlah.rm_lain1)
    );


    setText(
        "totalLain2Jam",
        num(jumlah.jam_lain2)
    );


    setText(
        "totalLain2RM",
        "RM " +
        rm(jumlah.rm_lain2)
    );


    setText(
        "totalJam",
        num(totalJam)
    );


    setText(
        "totalRM",
        "RM " +
        rm(totalRM)
    );



    // =================================================
    // SUMMARY CARDS
    // =================================================

    setText(
        "summaryAnggota",
        rows.length
    );


    setText(
        "summaryJam",
        num(totalJam)
    );


    setText(
        "summaryRM",
        "RM " +
        rm(totalRM)
    );


    setText(
        "finalJam",
        num(totalJam) +
        " JAM"
    );


    setText(
        "finalRM",
        "RM " +
        rm(totalRM)
    );

}



// =====================================================
// SUMMARY
// =====================================================

function paparSummary(
    rows,
    bulan,
    tahun,
    poskhidmat
){

    setText(
        "heroPos",
        poskhidmat
    );


    setText(
        "reportBadge",
        poskhidmat
    );


    setText(
        "finalBulan",
        `${SENARAI_BULAN[bulan]} ${tahun}`
    );


    setText(
        "finalPos",
        poskhidmat
    );

}



// =====================================================
// CETAK
// =====================================================

function cetakLaporan(){

    if(
        !dataCuti ||
        dataCuti.length === 0
    ){

        alert(
            "Tiada data untuk dicetak."
        );

        return;

    }


    window.print();

}



// =====================================================
// NUMBER
// =====================================================

function nombor(
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return 0;

    }


    const n =
        Number(value);


    return Number.isFinite(n)
        ? n
        : 0;

}



// =====================================================
// FORMAT NUMBER
// =====================================================

function num(
    value
){

    return nombor(value)
        .toLocaleString(
            "ms-MY",
            {
                minimumFractionDigits:0,
                maximumFractionDigits:0
            }
        );

}



// =====================================================
// FORMAT RM
// =====================================================

function rm(
    value
){

    return nombor(value)
        .toLocaleString(
            "ms-MY",
            {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }
        );

}



// =====================================================
// SET TEXT
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

        el.textContent =
            value;

    }

}



// =====================================================
// STATUS
// =====================================================

function setStatus(
    text
){

    setText(
        "status",
        text
    );

}



// =====================================================
// ESCAPE HTML
// =====================================================

function esc(
    value
){

    return String(
        value ?? ""
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
// AVATAR
// =====================================================

function binaAvatar(
    nama
){

    const teks =
        String(
            nama || ""
        )
        .trim();


    if(!teks){

        return "PT";

    }


    const bahagian =
        teks.split(/\s+/);


    if(
        bahagian.length === 1
    ){

        return bahagian[0]
            .substring(0,2)
            .toUpperCase();

    }


    return (
        bahagian[0][0] +
        bahagian[bahagian.length - 1][0]
    )
        .toUpperCase();

}
