// =====================================================
// RK02 TAMPUNGAN POS
// FPB DUTY COMMAND CENTER V2
// =====================================================


// =====================================================
// GLOBAL
// =====================================================

let pengguna = null;

let dataTampungan = [];

let dataAnggota = [];

let bulanSemasa = 0;

let tahunSemasa = 0;


// =====================================================
// SUPABASE
// =====================================================

const db = window.supabaseClient;


// =====================================================
// SENARAI BULAN
// =====================================================

const SENARAI_BULAN = [

    "",
    "JANUARI",
    "FEBRUARI",
    "MAC",
    "APRIL",
    "MEI",
    "JUN",
    "JULAI",
    "OGOS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DISEMBER"

];


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        console.log(
            "RK02 TAMPUNGAN START"
        );


        if(!db){

            setStatus(
                "Supabase client tidak dijumpai."
            );

            console.error(
                "SUPABASE CLIENT TIDAK DIJUMPAI"
            );

            return;

        }


        muatPengguna();

        isiBulan();

        pasangEvent();


        console.log(
            "RK02 TAMPUNGAN READY"
        );

    }
);


// =====================================================
// PENGGUNA
// =====================================================

function muatPengguna(){

    try{

        pengguna =
            JSON.parse(
                localStorage.getItem(
                    "pengguna"
                )
            );


        if(!pengguna){

            console.warn(
                "PENGGUNA TIDAK DIJUMPAI"
            );

            return;

        }


        document.getElementById(
            "namaPos"
        ).textContent =
            pengguna.poskhidmat || "-";


    }

    catch(error){

        console.error(
            "LOAD PENGGUNA ERROR",
            error
        );

    }

}


// =====================================================
// BULAN
// =====================================================

function isiBulan(){

    const select =
        document.getElementById(
            "bulan"
        );


    if(!select)
        return;


    select.value =
        new Date().getMonth() + 1;

}


// =====================================================
// EVENT
// =====================================================

function pasangEvent(){

    document
        .getElementById("btnPapar")
        ?.addEventListener(
            "click",
            paparTampungan
        );


    document
        .getElementById("btnUpdate")
        ?.addEventListener(
            "click",
            updateSemuaRM
        );

}


// =====================================================
// PAPAR
// =====================================================

async function paparTampungan(){

    bulanSemasa =
        Number(
            document.getElementById(
                "bulan"
            ).value
        );


    tahunSemasa =
        Number(
            document.getElementById(
                "tahun"
            ).value
        );


    if(
        !bulanSemasa ||
        !tahunSemasa
    ){

        alert(
            "Sila pilih bulan dan tahun."
        );

        return;

    }


    document.getElementById(
        "bulanTahun"
    ).textContent =
        SENARAI_BULAN[
            bulanSemasa
        ]
        +
        " "
        +
        tahunSemasa;


    setStatus(
        "Sedang mengambil data..."
    );


    await muatAnggota();

    await muatTampungan();


    binaPaparan();


}


// =====================================================
// LOAD ANGGOTA
// =====================================================

async function muatAnggota(){

    try{

        const {

            data,
            error

        } =
        await db
            .from("Data_Anggota")
            .select(`
                noskb,
                nama,
                pangkat,
                poskhidmat,
                unit,
                rm_pehariklmbiasa
            `);


        if(error)
            throw error;


        dataAnggota =
            data || [];


        console.log(
            "DATA ANGGOTA",
            dataAnggota
        );


    }

    catch(error){

        console.error(
            "LOAD ANGGOTA ERROR",
            error
        );


        setStatus(
            "Gagal mengambil Data_Anggota."
        );

    }

}


// =====================================================
// LOAD TAMPUNGAN
// =====================================================

async function muatTampungan(){

    try{

        let query =
            db
                .from(
                    "rk02_pos_tampungan"
                )
                .select("*")
                .eq(
                    "bulan",
                    bulanSemasa
                )
                .eq(
                    "tahun",
                    tahunSemasa
                );


        if(
            pengguna &&
            pengguna.poskhidmat
        ){

            query =
                query.eq(
                    "poskhidmat",
                    pengguna.poskhidmat
                );

        }


        const {

            data,
            error

        } =
        await query;


        if(error)
            throw error;


        dataTampungan =
            data || [];


        console.log(
            "DATA TAMPUNGAN",
            dataTampungan
        );


    }

    catch(error){

        console.error(
            "LOAD TAMPUNGAN ERROR",
            error
        );


        setStatus(
            "Gagal mengambil data tampungan."
        );

    }

}


// =====================================================
// CARI ANGGOTA
// =====================================================

function cariAnggota(noSKB){

    return dataAnggota.find(
        anggota =>
            String(
                anggota.noskb
            )
            ===
            String(noSKB)
    );

}


// =====================================================
// KADAR RM
// =====================================================

function kadarRM(anggota){

    if(!anggota)
        return 0;


    return Number(
        String(
            anggota.rm_pehariklmbiasa || 0
        )
        .replace(/,/g,"")
        .trim()
    );

}


// =====================================================
// KIRA RM POS
// =====================================================

function kiraRM(jam, anggota){

    const kadar =
        kadarRM(anggota);


    return (
        Number(jam || 0)
        *
        kadar
    );

}


// =====================================================
// FORMAT
// =====================================================

function formatJam(value){

    return Number(
        value || 0
    )
    .toLocaleString(
        "ms-MY",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


function formatRM(value){

    return Number(
        value || 0
    )
    .toLocaleString(
        "ms-MY",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


// =====================================================
// BINA PAPARAN
// =====================================================

function binaPaparan(){

    const container =
        document.getElementById(
            "senaraiAnggota"
        );


    container.innerHTML = "";


    if(
        !dataTampungan.length
    ){

        container.innerHTML = `

            <div class="no-data">

                Tiada data tampungan
                bagi bulan dan tahun
                yang dipilih.

            </div>

        `;


        kemasKiniJumlah(
            0,
            0,
            0
        );


        setStatus(
            "Tiada data tampungan dijumpai."
        );


        return;

    }


    let jumlahAnggota = 0;

    let jumlahJam = 0;

    let jumlahRM = 0;


    dataTampungan.forEach(
        (row)=>{


            const anggota =
                cariAnggota(
                    row.no_skb
                );


            const nama =
                row.nama
                ||
                anggota?.nama
                ||
                "-";


            const pangkat =
                anggota?.pangkat
                ||
                "";


            const kadar =
                kadarRM(
                    anggota
                );


            const posData = [];


            for(
                let i=1;
                i<=6;
                i++
            ){

                const namaPos =
                    row[
                        `pos${i}`
                    ];


                const jam =
                    Number(
                        row[
                            `jam_pos${i}`
                        ] || 0
                    );


                if(
                    namaPos &&
                    String(
                        namaPos
                    ).trim() !== ""
                ){

                    const rm =
                        kiraRM(
                            jam,
                            anggota
                        );


                    posData.push({

                        no:i,

                        namaPos:
                            namaPos,

                        jam:jam,

                        rm:rm

                    });


                    jumlahJam +=
                        jam;


                    jumlahRM +=
                        rm;

                }

            }


            const jumlahJamAnggota =
                posData.reduce(
                    (
                        total,
                        pos
                    ) =>
                        total +
                        pos.jam,
                    0
                );


            const jumlahRMAnggota =
                posData.reduce(
                    (
                        total,
                        pos
                    ) =>
                        total +
                        pos.rm,
                    0
                );


            jumlahAnggota++;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "anggota-card";


            card.dataset.id =
                row.id;


            card.innerHTML = `

                <div class="anggota-header">

                    <div class="anggota-nama">

                        ${escapeHTML(
                            nama
                        )}

                    </div>


                    <div class="anggota-info">

                        <span>
                            SKB:
                            <strong>
                                ${escapeHTML(
                                    row.no_skb
                                )}
                            </strong>
                        </span>


                        <span>
                            ${
                                escapeHTML(
                                    pangkat
                                )
                            }
                        </span>


                        <span>
                            Kadar:
                            RM
                            ${formatRM(
                                kadar
                            )}
                        </span>

                    </div>

                </div>


                <div class="anggota-body">

                    <div class="pos-list">

                        ${
                            binaPosHTML(
                                posData
                            )
                        }

                    </div>


                    <div class="anggota-total">

                        <div>

                            <div class="total-label">
                                JUMLAH JAM TAMPUNGAN
                            </div>

                            <div class="total-value">

                                ${formatJam(
                                    jumlahJamAnggota
                                )}
                                JAM

                            </div>

                        </div>


                        <div>

                            <div class="total-label">
                                JUMLAH RM TAMPUNGAN
                            </div>

                            <div class="total-value">

                                RM
                                ${formatRM(
                                    jumlahRMAnggota
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );


        }
    );


    kemasKiniJumlah(
        jumlahAnggota,
        jumlahJam,
        jumlahRM
    );


    setStatus(
        `${jumlahAnggota} anggota dipaparkan.`
    );

}


// =====================================================
// BINA POS HTML
// =====================================================

function binaPosHTML(posData){

    if(!posData.length){

        return `

            <div class="no-data">

                Tiada pos tampungan.

            </div>

        `;

    }


    return posData.map(
        pos => `

            <div class="pos-card">

                <div class="pos-name">

                    ${escapeHTML(
                        pos.namaPos
                    )}

                </div>


                <div class="pos-data">

                    <div class="pos-data-box">

                        <div class="pos-data-label">
                            JAM TAMPUNGAN
                        </div>

                        <div class="pos-data-value">

                            ${formatJam(
                                pos.jam
                            )}
                            JAM

                        </div>

                    </div>


                    <div class="pos-data-box">

                        <div class="pos-data-label">
                            RM TAMPUNGAN
                        </div>

                        <div class="pos-data-value">

                            RM
                            ${formatRM(
                                pos.rm
                            )}

                        </div>

                    </div>

                </div>

            </div>

        `
    ).join("");

}


// =====================================================
// JUMLAH
// =====================================================

function kemasKiniJumlah(
    jumlahAnggota,
    jumlahJam,
    jumlahRM
){

    document.getElementById(
        "jumlahAnggota"
    ).textContent =
        jumlahAnggota;


    document.getElementById(
        "jumlahJam"
    ).textContent =
        formatJam(
            jumlahJam
        )
        +
        " JAM";


    document.getElementById(
        "jumlahRM"
    ).textContent =
        "RM "
        +
        formatRM(
            jumlahRM
        );

}


// =====================================================
// UPDATE SEMUA RM KE SUPABASE
// =====================================================
// SEMUA JAM X rm_pehariklmbiasa
// rm_tampungan TIDAK DISENTUH
// =====================================================

async function updateSemuaRM(){

    if(
        !dataTampungan.length
    ){

        alert(
            "Tiada data untuk dikemaskini."
        );

        return;

    }


    const sahkan =
        confirm(
            "Kemas kini semua RM ke Supabase?"
        );


    if(!sahkan)
        return;


    setStatus(
        "Sedang mengira dan mengemaskini RM ke Supabase..."
    );


    try{

        let berjaya = 0;


        for(
            const row
            of dataTampungan
        ){

            // -----------------------------------------
            // CARI DATA ANGGOTA
            // -----------------------------------------

            const anggota =
                cariAnggota(
                    row.no_skb
                );


            if(!anggota){

                console.warn(
                    "ANGGOTA TIDAK DIJUMPAI:",
                    row.no_skb
                );

                continue;

            }


            // -----------------------------------------
            // KADAR RM
            // -----------------------------------------

            const kadar =
                kadarRM(
                    anggota
                );


            // -----------------------------------------
            // KIRA RM POS 1 - 6
            // -----------------------------------------

            const rmPos = {};


            for(
                let i = 1;
                i <= 6;
                i++
            ){

                const jam =
                    Number(
                        row[
                            `jam_pos${i}`
                        ] || 0
                    );


                rmPos[
                    `rm_pos${i}`
                ] =
                    jam * kadar;

            }


            // -----------------------------------------
            // KIRA RM ESKOT
            // -----------------------------------------

            const jamEskot =
                Number(
                    row.eskot || 0
                );


            const rmEskot =
                jamEskot * kadar;


            // -----------------------------------------
            // KIRA RM CIT
            // -----------------------------------------

            const jamCit =
                Number(
                    row.cit || 0
                );


            const rmCit =
                jamCit * kadar;


            // -----------------------------------------
            // KIRA RM KAWALAN TAMBAHAN
            // -----------------------------------------

            const jamKawalanTambahan =
                Number(
                    row.kawalan_tambahan || 0
                );


            const rmKawalanTambahan =
                jamKawalanTambahan * kadar;


            // -----------------------------------------
            // KIRA RM KAWALAN WANG
            // -----------------------------------------

            const jamKawalanWang =
                Number(
                    row.kawalan_wang || 0
                );


            const rmKawalanWang =
                jamKawalanWang * kadar;


            // -----------------------------------------
            // KIRA RM PEMANDU
            // -----------------------------------------

            const jamPemandu =
                Number(
                    row.pemandu || 0
                );


            const rmPemandu =
                jamPemandu * kadar;


            // -----------------------------------------
            // DATA UNTUK SUPABASE
            // -----------------------------------------
            // NOTA:
            // rm_tampungan TIDAK DIMASUKKAN
            // -----------------------------------------

            const updateData = {

                rm_pos1:
                    rmPos.rm_pos1,

                rm_pos2:
                    rmPos.rm_pos2,

                rm_pos3:
                    rmPos.rm_pos3,

                rm_pos4:
                    rmPos.rm_pos4,

                rm_pos5:
                    rmPos.rm_pos5,

                rm_pos6:
                    rmPos.rm_pos6,

                rm_eskot:
                    rmEskot,

                rm_cit:
                    rmCit,

                rm_kawalan_tambahan:
                    rmKawalanTambahan,

                rm_kawalan_wang:
                    rmKawalanWang,

                rm_pemandu:
                    rmPemandu

            };


            // -----------------------------------------
            // UPDATE SUPABASE
            // -----------------------------------------

            const {
                error
            } =
            await db
                .from(
                    "rk02_pos_tampungan"
                )
                .update(
                    updateData
                )
                .eq(
                    "id",
                    row.id
                );


            if(error)
                throw error;


            // -----------------------------------------
            // KEMAS KINI DATA TEMPATAN
            // -----------------------------------------

            Object.assign(
                row,
                updateData
            );


            berjaya++;

        }


        // -----------------------------------------
        // SELESAI
        // -----------------------------------------

        setStatus(
            `${berjaya} rekod RM berjaya dikemaskini ke Supabase.`
        );


        alert(
            `${berjaya} rekod RM berjaya dikemaskini.`
        );


    }

    catch(error){

        console.error(
            "UPDATE RM ERROR:",
            error
        );


        setStatus(
            "Gagal mengemaskini RM ke Supabase."
        );


        alert(
            "Gagal mengemaskini RM ke Supabase.\n\n"
            +
            error.message
        );

    }

}

// =====================================================
// STATUS
// =====================================================

function setStatus(message){

    const el =
        document.getElementById(
            "status"
        );


    if(el){

        el.textContent =
            message;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value){

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
