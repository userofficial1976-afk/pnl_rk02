// =========================================================
// TAMPUNGAN PENUH
// FPB DUTY COMMAND CENTER V2
// =========================================================
// DATABASE:
// rk02_pos_tampungan
//
// STRUKTUR:
// pos1 ... pos6
// jam_pos1 ... jam_pos6
// rm_pos1 ... rm_pos6
//
// BASIC GAJI:
// Data_Anggota.gaji_pokok
// berdasarkan no_skb
//
// PAPARAN + EXCEL:
// Menggunakan dataTampungan yang sama
// SORT TEMPAT TAMPUNGAN A-Z
// =========================================================


// =========================================================
// GLOBAL
// =========================================================

let supabaseClient = null;

let dataTampungan = [];


// =========================================================
// TABLE
// =========================================================

const TABLE_TAMPUNGAN =
    "rk02_pos_tampungan";

const TABLE_ANGGOTA =
    "Data_Anggota";


// =========================================================
// SENARAI BULAN
// =========================================================

const SENARAI_BULAN = [
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


// =========================================================
// DOM
// =========================================================

const bulanEl =
    document.getElementById("bulan");

const tahunEl =
    document.getElementById("tahun");

const posEl =
    document.getElementById("posKhidmat");

const btnPapar =
    document.getElementById("btnPaparData");

const btnExcel =
    document.getElementById("btnDownloadExcel");

const tbody =
    document.getElementById("tbodyTampungan");

const statusEl =
    document.getElementById("status");

const tajukLaporan =
    document.getElementById("tajukLaporan");

const subtajukLaporan =
    document.getElementById("subtajukLaporan");

const jumlahRekodEl =
    document.getElementById("jumlahRekod");

const jumlahJamEl =
    document.getElementById("jumlahJam");

const jumlahKlmEl =
    document.getElementById("jumlahKlm");


// =========================================================
// INIT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    console.log(
        "TAMPUNGAN PENUH: INIT"
    );


    // -----------------------------------------------------
    // SEMAK SUPABASE CLIENT
    // -----------------------------------------------------

    if (
        !window.supabaseClient
    ) {

        console.error(
            "SUPABASE CLIENT TIDAK DIJUMPAI"
        );


        setStatus(
            "Supabase Client tidak dijumpai. Pastikan supabase-config.js dimuatkan dahulu.",
            "error"
        );


        return;
    }


    supabaseClient =
        window.supabaseClient;


    console.log(
        "TAMPUNGAN PENUH: SUPABASE CLIENT OK"
    );


    // -----------------------------------------------------
    // ISI FILTER
    // -----------------------------------------------------

    isiBulan();

    isiTahun();


    // -----------------------------------------------------
    // AMBIL SENARAI POS KHIDMAT
    // -----------------------------------------------------

    await isiPosKhidmat();


    // -----------------------------------------------------
    // STATUS AWAL
    // -----------------------------------------------------

    setStatus(
        "Sila pilih bulan dan tahun kemudian tekan PAPAR DATA.",
        ""
    );
}


// =========================================================
// EVENT
// =========================================================

if (btnPapar) {

    btnPapar.addEventListener(
        "click",
        paparData
    );
}


if (btnExcel) {

    btnExcel.addEventListener(
        "click",
        downloadExcel
    );
}


// =========================================================
// BULAN
// =========================================================

function isiBulan() {

    bulanEl.innerHTML = "";


    SENARAI_BULAN.forEach(
        (bulan, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index + 1;


            option.textContent =
                bulan;


            if (
                index ===
                new Date().getMonth()
            ) {

                option.selected =
                    true;
            }


            bulanEl.appendChild(
                option
            );
        }
    );
}


// =========================================================
// TAHUN
// =========================================================

function isiTahun() {

    tahunEl.innerHTML = "";


    const tahunSemasa =
        new Date().getFullYear();


    for (
        let tahun =
            tahunSemasa - 2;

        tahun <=
            tahunSemasa + 2;

        tahun++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            tahun;


        option.textContent =
            tahun;


        if (
            tahun ===
            tahunSemasa
        ) {

            option.selected =
                true;
        }


        tahunEl.appendChild(
            option
        );
    }
}


// =========================================================
// POS KHIDMAT
// =========================================================
//
// PENTING:
// Data_Anggota ANDA TIDAK ADA COLUMN "pos".
// Berdasarkan schema projek:
// gunakan "poskhidmat".
//
// Tetapi untuk lebih selamat kita ambil POS daripada
// rk02_pos_tampungan sendiri kerana column tersebut
// memang wujud.
// =========================================================

async function isiPosKhidmat() {

    if (!supabaseClient) {

        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from(
                TABLE_TAMPUNGAN
            )

            .select(
                "poskhidmat"
            )

            .not(
                "poskhidmat",
                "is",
                null
            );


        if (error) {

            console.error(
                "Gagal ambil POS KHIDMAT:",
                error
            );


            setStatus(
                "Gagal mengambil senarai POS KHIDMAT.",
                "error"
            );


            return;
        }


        const senarai =
            [
                ...new Set(
                    (data || [])

                        .map(
                            row =>
                                clean(
                                    row.poskhidmat
                                )
                        )

                        .filter(
                            Boolean
                        )
                )
            ]

            .sort(
                compareMalay
            );


        posEl.innerHTML = `
            <option value="">
                SEMUA
            </option>
        `;


        senarai.forEach(
            pos => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    pos;


                option.textContent =
                    pos;


                posEl.appendChild(
                    option
                );
            }
        );


        console.log(
            "SENARAI POS KHIDMAT:",
            senarai
        );


    } catch (error) {

        console.error(
            "RALAT ISI POS:",
            error
        );
    }
}


// =========================================================
// PAPAR DATA
// =========================================================

async function paparData() {

    if (!supabaseClient) {

        setStatus(
            "Supabase Client belum tersedia.",
            "error"
        );


        return;
    }


    const bulan =
        Number(
            bulanEl.value
        );


    const tahun =
        Number(
            tahunEl.value
        );


    const posKhidmat =
        clean(
            posEl.value
        );


    console.log(
        "FILTER:",
        {
            bulan,
            tahun,
            posKhidmat
        }
    );


    btnPapar.disabled =
        true;


    btnExcel.disabled =
        true;


    setStatus(
        "Sedang mengambil data tampungan...",
        "loading"
    );


    try {

        // =================================================
        // AMBIL DATA TAMPUNGAN
        // =================================================

        const {
            data,
            error
        } = await supabaseClient

            .from(
                TABLE_TAMPUNGAN
            )

            .select(
                "*"
            )

            .eq(
                "bulan",
                bulan
            )

            .eq(
                "tahun",
                tahun
            );


        if (error) {

            throw error;
        }


        console.log(
            "DATA RAW TAMPUNGAN:",
            data
        );


        // =================================================
        // FILTER POS KHIDMAT
        // =================================================

        let rows =
            data || [];


        if (
            posKhidmat
        ) {

            rows =
                rows.filter(
                    row =>
                        clean(
                            row.poskhidmat
                        ).toUpperCase()
                        ===
                        posKhidmat
                            .toUpperCase()
                );
        }


        console.log(
            "SELEPAS FILTER BULAN/TAHUN/POS:",
            rows
        );


        // =================================================
        // PECAHKAN POS1 - POS6
        // =================================================

        let hasil =
            binaBarisTampungan(
                rows
            );


        console.log(
            "SELEPAS PECAH POS1-POS6:",
            hasil
        );


        // =================================================
        // BASIC GAJI
        // =================================================

        hasil =
            await lengkapkanBasicGaji(
                hasil
            );


        // =================================================
        // SORT TEMPAT TAMPUNGAN A-Z
        // =================================================

        hasil.sort(
            (a, b) => {

                // -----------------------------------------
                // TEMPAT TAMPUNGAN
                // -----------------------------------------

                const tempat =
                    compareMalay(
                        a.tempat,
                        b.tempat
                    );


                if (
                    tempat !== 0
                ) {

                    return tempat;
                }


                // -----------------------------------------
                // NAMA
                // -----------------------------------------

                const nama =
                    compareMalay(
                        a.nama,
                        b.nama
                    );


                if (
                    nama !== 0
                ) {

                    return nama;
                }


                // -----------------------------------------
                // SKB
                // -----------------------------------------

                return compareMalay(
                    a.no_skb,
                    b.no_skb
                );
            }
        );


        // =================================================
        // BIL SELEPAS SORT
        // =================================================

        dataTampungan =
            hasil.map(
                (row, index) => ({

                    ...row,

                    bil:
                        index + 1
                })
            );


        console.log(
            "DATA AKHIR TAMPUNGAN:",
            dataTampungan
        );


        // =================================================
        // PAPAR
        // =================================================

        renderTable();

        renderSummary();


        // =================================================
        // TAJUK
        // =================================================

        const namaBulan =
            SENARAI_BULAN[
                bulan - 1
            ] || "";


        tajukLaporan.textContent =
            `TAMPUNGAN PENUH — ${namaBulan.toUpperCase()} ${tahun}`;


        if (
            posKhidmat
        ) {

            subtajukLaporan.textContent =
                `POS KHIDMAT: ${posKhidmat} • SUSUNAN: TEMPAT TAMPUNGAN A–Z`;

        } else {

            subtajukLaporan.textContent =
                "SEMUA POS KHIDMAT • SUSUNAN: TEMPAT TAMPUNGAN A–Z";
        }


        // =================================================
        // EXCEL
        // =================================================

        btnExcel.disabled =
            dataTampungan.length === 0;


        // =================================================
        // STATUS
        // =================================================

        setStatus(
            `${dataTampungan.length} rekod tampungan dijumpai. Susunan TEMPAT TAMPUNGAN A–Z.`,
            "success"
        );


    } catch (error) {

        console.error(
            "RALAT TAMPUNGAN:",
            error
        );


        dataTampungan =
            [];


        renderTable();

        renderSummary();


        setStatus(
            "Gagal mengambil data tampungan. Semak Console dan struktur Supabase.",
            "error"
        );


    } finally {

        btnPapar.disabled =
            false;
    }
}


// =========================================================
// BINA BARIS TAMPUNGAN
// =========================================================
//
// SATU rekod Supabase boleh mempunyai:
// pos1
// pos2
// pos3
// pos4
// pos5
// pos6
//
// Setiap POS yang mempunyai jam > 0 akan menjadi SATU BARIS.
//
// Contoh:
//
// pos1 = F102-01
// jam_pos1 = 4
// rm_pos1 = 76.41
//
// akan menjadi:
//
// TEMPAT TAMPUNGAN = F102-01
// JAM = 4
// KLM = 76.41
// =========================================================

function binaBarisTampungan(
    rows
) {

    const hasil =
        [];


    const pasangan =
        [
            {
                tempat: "pos1",
                jam: "jam_pos1",
                rm: "rm_pos1"
            },

            {
                tempat: "pos2",
                jam: "jam_pos2",
                rm: "rm_pos2"
            },

            {
                tempat: "pos3",
                jam: "jam_pos3",
                rm: "rm_pos3"
            },

            {
                tempat: "pos4",
                jam: "jam_pos4",
                rm: "rm_pos4"
            },

            {
                tempat: "pos5",
                jam: "jam_pos5",
                rm: "rm_pos5"
            },

            {
                tempat: "pos6",
                jam: "jam_pos6",
                rm: "rm_pos6"
            }
        ];


    rows.forEach(
        row => {

            pasangan.forEach(
                pasanganItem => {

                    const tempat =
                        clean(
                            row[
                                pasanganItem
                                    .tempat
                            ]
                        );


                    const jam =
                        toNumber(
                            row[
                                pasanganItem
                                    .jam
                            ]
                        );


                    const rm =
                        toNumber(
                            row[
                                pasanganItem
                                    .rm
                            ]
                        );


                    // -------------------------------------
                    // HANYA PAPAR POS YANG ADA DATA
                    //
                    // Walaupun jam = 0 tetapi ada tempat,
                    // kita masih boleh paparkan jika RM ada.
                    // -------------------------------------

                    if (
                        !tempat
                    ) {

                        return;
                    }


                    if (
                        jam <= 0
                        &&
                        rm <= 0
                    ) {

                        return;
                    }


                    hasil.push({

                        bil: 0,

                        tempat:
                            tempat,

                        no_skb:
                            clean(
                                row.no_skb
                            ),

                        nama:
                            clean(
                                row.nama
                            ),

                        pos:
                            clean(
                                row.poskhidmat
                            ),

                        gaji:
                            0,

                        jam:
                            jam,

                        klm:
                            rm
                    });
                }
            );
        }
    );


    return hasil;
}


// =========================================================
// BASIC GAJI
// =========================================================
//
// Ambil daripada Data_Anggota.gaji_pokok
// berdasarkan no_skb.
//
// TIDAK guna column "pos" kerana Data_Anggota anda
// tidak mempunyai column tersebut.
// =========================================================

// =========================================================
// BASIC GAJI
// =========================================================
// DATA_ANGGOTA MENGGUNAKAN:
// noskb
//
// BUKAN:
// no_skb
// =========================================================

async function lengkapkanBasicGaji(rows) {

    if (!rows.length) {
        return rows;
    }


    const skbList =
        [
            ...new Set(

                rows

                    .map(
                        row =>
                            clean(row.no_skb)
                    )

                    .filter(Boolean)
            )
        ];


    if (!skbList.length) {
        return rows;
    }


    try {

        console.log(
            "CARI BASIC GAJI UNTUK SKB:",
            skbList
        );


        const {
            data,
            error
        } = await supabaseClient

            .from(TABLE_ANGGOTA)

            .select(
                "noskb,nama,gaji_pokok"
            )

            .in(
                "noskb",
                skbList
            );


        if (error) {

            console.error(
                "GAGAL AMBIL BASIC GAJI:",
                error
            );

            return rows;
        }


        console.log(
            "DATA ANGGOTA BASIC GAJI:",
            data
        );


        const map =
            new Map();


        (data || []).forEach(
            member => {

                map.set(
                    clean(
                        member.noskb
                    ),
                    member
                );
            }
        );


        return rows.map(
            row => {

                const member =
                    map.get(
                        clean(
                            row.no_skb
                        )
                    );


                if (!member) {

                    console.warn(
                        "SKB TIADA DALAM DATA_ANGGOTA:",
                        row.no_skb
                    );


                    return row;
                }


                return {

                    ...row,

                    nama:
                        row.nama ||
                        member.nama ||
                        "",

                    gaji:
                        toNumber(
                            member.gaji_pokok
                        )
                };
            }
        );


    } catch (error) {

        console.error(
            "RALAT BASIC GAJI:",
            error
        );


        return rows;
    }
}


// =========================================================
// RENDER TABLE
// =========================================================

function renderTable() {

    if (
        !dataTampungan.length
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty"
                >
                    Tiada data tampungan untuk pilihan tersebut.
                </td>
            </tr>
        `;


        return;
    }


    tbody.innerHTML =
        dataTampungan
            .map(
                row => `

                <tr>

                    <td class="bil">
                        ${row.bil}
                    </td>


                    <td class="cell-place">
                        ${escapeHtml(
                            row.tempat
                        )}
                    </td>


                    <td class="cell-skb">
                        ${escapeHtml(
                            row.no_skb
                        )}
                    </td>


                    <td class="cell-name">
                        ${escapeHtml(
                            row.nama
                        )}
                    </td>


                    <td class="cell-pos">
                        ${escapeHtml(
                            row.pos
                        )}
                    </td>


                    <td class="money">
                        RM ${formatMoney(
                            row.gaji
                        )}
                    </td>


                    <td class="jam">
                        ${formatNumber(
                            row.jam
                        )}
                    </td>


                    <td class="money">
                        RM ${formatMoney(
                            row.klm
                        )}
                    </td>

                </tr>
            `
            )
            .join("");
}


// =========================================================
// SUMMARY
// =========================================================

function renderSummary() {

    const jumlahRekod =
        dataTampungan.length;


    const jumlahJam =
        dataTampungan.reduce(
            (
                total,
                row
            ) =>
                total +
                toNumber(
                    row.jam
                ),
            0
        );


    const jumlahKlm =
        dataTampungan.reduce(
            (
                total,
                row
            ) =>
                total +
                toNumber(
                    row.klm
                ),
            0
        );


    jumlahRekodEl.textContent =
        jumlahRekod.toLocaleString(
            "ms-MY"
        );


    jumlahJamEl.textContent =
        formatNumber(
            jumlahJam
        );


    jumlahKlmEl.textContent =
        `RM ${formatMoney(
            jumlahKlm
        )}`;
}


// =========================================================
// DOWNLOAD EXCEL
// =========================================================
//
// PENTING:
//
// Excel menggunakan dataTampungan yang SAMA
// dengan paparan HTML.
//
// Jadi:
// PAPAR = A-Z
// EXCEL = A-Z
// BIL = SAMA
// =========================================================

function downloadExcel() {

    if (
        !dataTampungan.length
    ) {

        alert(
            "Tiada data untuk dimuat turun."
        );


        return;
    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Library Excel XLSX belum dimuatkan."
        );


        return;
    }


    const bulanNumber =
        Number(
            bulanEl.value
        );


    const tahun =
        Number(
            tahunEl.value
        );


    const namaBulan =
        SENARAI_BULAN[
            bulanNumber - 1
        ] || "";


    const posKhidmat =
        clean(
            posEl.value
        ) ||
        "SEMUA";


    // =====================================================
    // DATA EXCEL
    // =====================================================

    const excelData =
        dataTampungan.map(
            row => ({

                "BIL":
                    row.bil,

                "TEMPAT TAMPUNGAN":
                    row.tempat,

                "SKB":
                    row.no_skb,

                "NAMA ANGGOTA":
                    row.nama,

                "POS":
                    row.pos,

                "BASIC GAJI":
                    row.gaji,

                "JUMLAH JAM TAMPUNG / BLN":
                    row.jam,

                "JUMLAH KLM (RM)":
                    row.klm
            })
        );


    // =====================================================
    // JUMLAH
    // =====================================================

    const totalJam =
        dataTampungan.reduce(
            (
                total,
                row
            ) =>
                total +
                toNumber(
                    row.jam
                ),
            0
        );


    const totalKlm =
        dataTampungan.reduce(
            (
                total,
                row
            ) =>
                total +
                toNumber(
                    row.klm
                ),
            0
        );


    excelData.push({

        "BIL":
            "",

        "TEMPAT TAMPUNGAN":
            "JUMLAH",

        "SKB":
            "",

        "NAMA ANGGOTA":
            "",

        "POS":
            "",

        "BASIC GAJI":
            "",

        "JUMLAH JAM TAMPUNG / BLN":
            totalJam,

        "JUMLAH KLM (RM)":
            totalKlm
    });


    // =====================================================
    // WORKSHEET
    // =====================================================

    const worksheet =
        XLSX.utils.json_to_sheet(
            excelData
        );


    // =====================================================
    // LEBAR COLUMN
    // =====================================================

    worksheet["!cols"] = [

        {
            wch: 7
        },

        {
            wch: 42
        },

        {
            wch: 15
        },

        {
            wch: 38
        },

        {
            wch: 35
        },

        {
            wch: 16
        },

        {
            wch: 25
        },

        {
            wch: 20
        }
    ];


    // =====================================================
    // FORMAT CELL
    // =====================================================

    const range =
        XLSX.utils.decode_range(
            worksheet["!ref"]
        );


    for (
        let r = 1;

        r <= range.e.r;

        r++
    ) {

        // BASIC GAJI
        const basicCell =
            XLSX.utils.encode_cell({

                r,

                c: 5
            });


        // JAM
        const jamCell =
            XLSX.utils.encode_cell({

                r,

                c: 6
            });


        // KLM
        const klmCell =
            XLSX.utils.encode_cell({

                r,

                c: 7
            });


        if (
            worksheet[
                basicCell
            ]
        ) {

            worksheet[
                basicCell
            ].z =
                "#,##0.00";
        }


        if (
            worksheet[
                jamCell
            ]
        ) {

            worksheet[
                jamCell
            ].z =
                "#,##0.##";
        }


        if (
            worksheet[
                klmCell
            ]
        ) {

            worksheet[
                klmCell
            ].z =
                "#,##0.00";
        }
    }


    // =====================================================
    // WORKBOOK
    // =====================================================

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Tampungan Penuh"
    );


    // =====================================================
    // NAMA FAIL
    // =====================================================

    const posFile =
        posKhidmat ===
            "SEMUA"

            ? "SEMUA"

            : sanitizeFilename(
                posKhidmat
            );


    const namaFail =
        `TAMPUNGAN_PENUH_${sanitizeFilename(
            namaBulan
        )}_${tahun}_${posFile}.xlsx`;


    // =====================================================
    // DOWNLOAD
    // =====================================================

    XLSX.writeFile(
        workbook,
        namaFail
    );


    setStatus(
        `Excel berjaya dimuat turun: ${namaFail}`,
        "success"
    );
}


// =========================================================
// HELPER
// =========================================================

function clean(
    value
) {

    return String(
        value ?? ""
    ).trim();
}


// =========================================================
// NUMBER
// =========================================================

function toNumber(
    value
) {

    if (
        typeof value ===
        "number"
    ) {

        return Number.isFinite(
            value
        )
            ? value
            : 0;
    }


    if (
        value ===
            null
        ||
        value ===
            undefined
        ||
        value ===
            ""
    ) {

        return 0;
    }


    const text =
        String(value)

            .replace(
                /RM/gi,
                ""
            )

            .replace(
                /,/g,
                ""
            )

            .trim();


    const number =
        Number(text);


    return Number.isFinite(
        number
    )
        ? number
        : 0;
}


// =========================================================
// MONEY
// =========================================================

function formatMoney(
    value
) {

    return toNumber(
        value
    ).toLocaleString(

        "ms-MY",

        {

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2
        }
    );
}


// =========================================================
// NUMBER FORMAT
// =========================================================

function formatNumber(
    value
) {

    return toNumber(
        value
    ).toLocaleString(

        "ms-MY",

        {

            minimumFractionDigits:
                0,

            maximumFractionDigits:
                2
        }
    );
}


// =========================================================
// SORT MALAY
// =========================================================

function compareMalay(
    a,
    b
) {

    return String(
        a ?? ""
    ).localeCompare(

        String(
            b ?? ""
        ),

        "ms",

        {

            numeric:
                true,

            sensitivity:
                "base"
        }
    );
}


// =========================================================
// FILE NAME
// =========================================================

function sanitizeFilename(
    value
) {

    return String(
        value ?? "DATA"
    )

        .replace(
            /[\\/:*?"<>|]/g,
            "_"
        )

        .replace(
            /\s+/g,
            "_"
        );
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

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


// =========================================================
// STATUS
// =========================================================

function setStatus(
    message,
    type = ""
) {

    if (!statusEl) {

        return;
    }


    statusEl.textContent =
        message;


    statusEl.className =
        `status ${type}`;
}


// =========================================================
// DEBUG
// =========================================================

window.tampunganPenuh = {

    getData:
        () =>
            dataTampungan,

    paparData:
        paparData,

    downloadExcel:
        downloadExcel
};


console.log(
    "TAMPUNGAN PENUH JS READY"
);
