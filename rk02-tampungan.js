// =====================================================
// RK02 TAMPUNGAN
// PAPAR JAM + RM SETIAP ANGGOTA
// =====================================================


let pengguna = null;

let dataAnggota = [];

let dataTampungan = [];

let bulanDipilih = "";

let tahunDipilih = "";

let posDipilih = "";


// =====================================================
// SUPABASE
// =====================================================

const db =
    window.supabaseClient;


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

            console.error(
                "SUPABASE CLIENT TIDAK DIJUMPAI"
            );

            alert(
                "Supabase client tidak dijumpai."
            );

            return;

        }


        await muatPengguna();

        await muatAnggota();

        pasangEvent();

        console.log(
            "RK02 TAMPUNGAN READY"
        );

    }
);


// =====================================================
// MUAT PENGGUNA
// =====================================================

async function muatPengguna(){

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


        posDipilih =
            pengguna.poskhidmat || "";


        const inputPos =
            document.getElementById(
                "poskhidmat"
            );


        if(inputPos){

            inputPos.value =
                posDipilih;

        }

    }

    catch(error){

        console.error(
            "LOAD PENGGUNA ERROR",
            error
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

    }

}


// =====================================================
// EVENT
// =====================================================

function pasangEvent(){

    const btn =
        document.getElementById(
            "btnPapar"
        );


    if(btn){

        btn.addEventListener(
            "click",
            paparTampungan
        );

    }


    const btnSimpan =
        document.getElementById(
            "btnSimpan"
        );


    if(btnSimpan){

        btnSimpan.addEventListener(
            "click",
            simpanRMTampungan
        );

    }

}


// =====================================================
// PAPAR TAMPUNGAN
// =====================================================

async function paparTampungan(){

    bulanDipilih =
        Number(
            document.getElementById(
                "bulan"
            ).value
        );


    tahunDipilih =
        Number(
            document.getElementById(
                "tahun"
            ).value
        );


    posDipilih =
        document.getElementById(
            "poskhidmat"
        ).value.trim();


    if(
        !bulanDipilih ||
        !tahunDipilih ||
        !posDipilih
    ){

        alert(
            "Sila lengkapkan Bulan, Tahun dan Pos."
        );

        return;

    }


    paparMaklumat();


    await muatTampungan();

}


// =====================================================
// PAPAR MAKLUMAT
// =====================================================

function paparMaklumat(){

    setText(
        "paparBulan",
        SENARAI_BULAN[
            bulanDipilih
        ] || "-"
    );


    setText(
        "paparTahun",
        tahunDipilih || "-"
    );


    setText(
        "paparPos",
        posDipilih || "-"
    );

}


// =====================================================
// LOAD DATA TAMPUNGAN
// =====================================================

async function muatTampungan(){

    const container =
        document.getElementById(
            "senaraiTampungan"
        );


    container.innerHTML = `

        <div class="tiada-data">

            MEMUATKAN DATA...

        </div>

    `;


    try{

        const {
            data,
            error
        } =
        await db
        .from("rk02_pos_tampungan")
        .select("*")
        .eq(
            "bulan",
            bulanDipilih
        )
        .eq(
            "tahun",
            tahunDipilih
        )
        .eq(
            "poskhidmat",
            posDipilih
        )
        .order(
            "nama",
            {
                ascending:true
            }
        );


        if(error)
            throw error;


        dataTampungan =
            data || [];


        console.log(
            "DATA TAMPUNGAN",
            dataTampungan
        );


        binaCardAnggota();

        binaJumlahKeseluruhan();

    }

    catch(error){

        console.error(
            "LOAD TAMPUNGAN ERROR",
            error
        );


        container.innerHTML = `

            <div class="tiada-data">

                RALAT MEMUATKAN DATA TAMPUNGAN

            </div>

        `;

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
            ) ===
            String(noSKB)
    );

}


// =====================================================
// DAPATKAN POS AKTIF
// =====================================================

function dapatkanPosAktif(){

    const posAktif = [];


    for(
        let i = 1;
        i <= 6;
        i++
    ){

        let namaPos = "";


        for(
            const data
            of dataTampungan
        ){

            if(
                data[`pos${i}`] &&
                String(
                    data[`pos${i}`]
                ).trim() !== ""
            ){

                namaPos =
                    String(
                        data[`pos${i}`]
                    ).trim();

                break;

            }

        }


        if(namaPos){

            posAktif.push({

                index:i,

                nama:namaPos

            });

        }

    }


    return posAktif;

}


// =====================================================
// BINA CARD ANGGOTA
// =====================================================

function binaCardAnggota(){

    const container =
        document.getElementById(
            "senaraiTampungan"
        );


    container.innerHTML = "";


    if(
        !dataTampungan.length
    ){

        container.innerHTML = `

            <div class="tiada-data">

                TIADA DATA TAMPUNGAN
                BAGI BULAN / POS INI.

            </div>

        `;

        return;

    }


    const posAktif =
        dapatkanPosAktif();


    dataTampungan.forEach(
        (data,index)=>{


        const anggota =
            cariAnggota(
                data.no_skb
            );


        const kadarRM =
            Number(
                anggota?.rm_pehariklmbiasa ||
                0
            );


        let jumlahJam = 0;

        let jumlahRM = 0;


        let htmlPOS = "";


        // =====================================
        // POS
        // =====================================

        posAktif.forEach(
            pos=>{


            const jam =
                Number(
                    data[
                        `jam_pos${pos.index}`
                    ] || 0
                );


            const rm =
                jam * kadarRM;


            jumlahJam += jam;

            jumlahRM += rm;


            htmlPOS += `

                <div class="pos-card">

                    <div class="pos-name">

                        ${escapeHTML(
                            pos.nama
                        )}

                    </div>


                    <div class="pos-data">

                        <div class="pos-data-box">

                            <span class="pos-label">
                                JAM
                            </span>

                            <span class="pos-value">

                                ${jam.toFixed(2)}

                            </span>

                        </div>


                        <div class="pos-data-box">

                            <span class="pos-label">
                                RM
                            </span>

                            <span class="pos-value">

                                ${formatRM(
                                    rm
                                )}

                            </span>

                        </div>

                    </div>

                </div>

            `;

        });


        // =====================================
        // CARD
        // =====================================

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "anggota-card";


        card.dataset.id =
            data.id;


        card.dataset.rm =
            jumlahRM;


        card.innerHTML = `

            <div class="anggota-header">

                <div class="anggota-nama">

                    ${index + 1}.
                    ${escapeHTML(
                        data.nama ||
                        anggota?.nama ||
                        "-"
                    )}

                </div>


                <div class="anggota-skb">

                    NO SKB :
                    ${escapeHTML(
                        data.no_skb ||
                        "-"
                    )}

                </div>

            </div>


            <div class="anggota-pos-grid">

                ${htmlPOS}

            </div>


            <div class="anggota-footer">

                <div>

                    JUMLAH JAM :
                    ${jumlahJam.toFixed(2)}

                </div>


                <div>

                    JUMLAH RM :
                    RM ${formatRM(
                        jumlahRM
                    )}

                </div>

            </div>

        `;


        container.appendChild(
            card
        );

    });

}


// =====================================================
// JUMLAH KESELURUHAN
// =====================================================

function binaJumlahKeseluruhan(){

    const container =
        document.getElementById(
            "jumlahSetiapPos"
        );


    container.innerHTML = "";


    const posAktif =
        dapatkanPosAktif();


    const jumlah = {};


    posAktif.forEach(
        pos=>{

            jumlah[
                pos.index
            ] = {

                nama:pos.nama,

                jam:0,

                rm:0

            };

        }
    );


    let jumlahJam = 0;

    let jumlahRM = 0;


    // =========================================
    // KIRA
    // =========================================

    dataTampungan.forEach(
        data=>{


        const anggota =
            cariAnggota(
                data.no_skb
            );


        const kadarRM =
            Number(
                anggota?.rm_pehariklmbiasa ||
                0
            );


        posAktif.forEach(
            pos=>{


            const jam =
                Number(
                    data[
                        `jam_pos${pos.index}`
                    ] || 0
                );


            const rm =
                jam * kadarRM;


            jumlah[
                pos.index
            ].jam += jam;


            jumlah[
                pos.index
            ].rm += rm;


            jumlahJam += jam;

            jumlahRM += rm;

        });

    });


    // =========================================
    // PAPAR SETIAP POS
    // =========================================

    posAktif.forEach(
        pos=>{


        const item =
            jumlah[
                pos.index
            ];


        container.innerHTML += `

            <div class="jumlah-pos-card">

                <div class="jumlah-pos-name">

                    ${escapeHTML(
                        item.nama
                    )}

                </div>


                <div class="jumlah-pos-value">

                    ${item.jam.toFixed(2)}
                    JAM

                    &nbsp;&nbsp;

                    RM
                    ${formatRM(
                        item.rm
                    )}

                </div>

            </div>

        `;

    });


    // =========================================
    // JUMLAH AKHIR
    // =========================================

    setText(
        "jumlahJam",
        jumlahJam.toFixed(2)
        + " JAM"
    );


    setText(
        "jumlahRM",
        "RM "
        + formatRM(
            jumlahRM
        )
    );


    console.log(
        "JUMLAH TAMPUNGAN",
        {
            jumlahJam,
            jumlahRM
        }
    );

}


// =====================================================
// SIMPAN RM TAMPUNGAN
// =====================================================
//
// Buat masa ini table asal belum mempunyai
// column rm_tampungan.
//
// Fungsi ini akan update jika column tersebut
// sudah ditambah.
// =====================================================

async function simpanRMTampungan(){

    if(
        !dataTampungan.length
    ){

        alert(
            "Tiada data untuk disimpan."
        );

        return;

    }


    const confirmSimpan =
        confirm(
            "Simpan RM Tampungan ke Supabase?"
        );


    if(!confirmSimpan)
        return;


    try{

        for(
            const data
            of dataTampungan
        ){

            const anggota =
                cariAnggota(
                    data.no_skb
                );


            const kadarRM =
                Number(
                    anggota?.rm_pehariklmbiasa ||
                    0
                );


            let jumlahRM = 0;


            for(
                let i=1;
                i<=6;
                i++
            ){

                const jam =
                    Number(
                        data[
                            `jam_pos${i}`
                        ] || 0
                    );


                jumlahRM +=
                    jam * kadarRM;

            }


            const {
                error
            } =
            await db
            .from(
                "rk02_pos_tampungan"
            )
            .update({

                rm_tampungan:
                    jumlahRM

            })
            .eq(
                "id",
                data.id
            );


            if(error)
                throw error;

        }


        alert(
            "RM Tampungan berjaya disimpan."
        );


        await muatTampungan();

    }

    catch(error){

        console.error(
            "SIMPAN RM TAMPUNGAN ERROR",
            error
        );


        alert(
            "Gagal simpan RM Tampungan.\n\n"
            + error.message
        );

    }

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

        el.textContent =
            value ?? "-";

    }

}


// =====================================================
// FORMAT RM
// =====================================================

function formatRM(
    value
){

    return Number(
        value || 0
    ).toLocaleString(
        "ms-MY",
        {
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
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
