// =========================================================
// TAMPUNGAN PENUH
// FPB DUTY COMMAND CENTER V2
// =========================================================


// =========================================================
// SUPABASE
// =========================================================
//
// GANTIKAN DUA NILAI INI DENGAN CONNECTION SUPABASE
// YANG SAMA DIGUNAKAN OLEH PAGE LAIN.
// =========================================================

const { data, error } = await supabase
    .from("rk02_pos_tampungan")
    .select("*");


let supabaseClient = null;


// =========================================================
// DATA UTAMA
// =========================================================
//
// Data ini ialah DATA YANG SUDAH DISORT.
// HTML dan Excel menggunakan array yang sama.
// =========================================================

let dataTampungan = [];


// =========================================================
// TABLE
// =========================================================

const TABLE_TAMPUNGAN =
    "rk02_pos_tampungan";

const TABLE_ANGGOTA =
    "Data_Anggota";


// =========================================================
// BULAN
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


// =========================================================
// INIT
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    isiBulan();

    isiTahun();


    if (
        SUPABASE_URL ===
        "MASUKKAN_SUPABASE_URL"
        ||
        SUPABASE_ANON_KEY ===
        "MASUKKAN_SUPABASE_ANON_KEY"
    ) {

        setStatus(
            "Sila masukkan SUPABASE_URL dan SUPABASE_ANON_KEY dalam tampungan-penuh.js.",
            "error"
        );

        return;
    }


    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );


        await isiPosKhidmat();


    } catch (error) {

        console.error(
            "SUPABASE ERROR:",
            error
        );

        setStatus(
            "Gagal menyambung ke Supabase.",
            "error"
        );
    }
}


// =========================================================
// EVENT
// =========================================================

btnPapar.addEventListener(
    "click",
    paparData
);


btnExcel.addEventListener(
    "click",
    downloadExcel
);


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
                bulan;

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

async function isiPosKhidmat() {

    const {
        data,
        error
    } = await supabaseClient
        .from(TABLE_ANGGOTA)
        .select("pos")
        .not(
            "pos",
            "is",
            null
        );


    if (error) {

        console.warn(
            "Gagal ambil POS:",
            error
        );

        return;
    }


    const senarai =
        [
            ...new Set(
                (data || [])
                    .map(
                        item =>
                            clean(
                                item.pos
                            )
                    )
                    .filter(Boolean)
            )
        ]
        .sort(compareMalay);


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
}


// =========================================================
// PAPAR DATA
// =========================================================

async function paparData() {

    if (!supabaseClient) {

        setStatus(
            "Supabase belum disambungkan.",
            "error"
        );

        return;
    }


    const bulan =
        bulanEl.value;

    const tahun =
        Number(
            tahunEl.value
        );

    const pos =
        posEl.value;


    btnPapar.disabled =
        true;

    btnExcel.disabled =
        true;


    setStatus(
        "Sedang mengambil data...",
        "loading"
    );


    try {

        // -------------------------------------------------
        // AMBIL DATA
        // -------------------------------------------------

        const {
            data,
            error
        } = await supabaseClient
            .from(TABLE_TAMPUNGAN)
            .select("*");


        if (error) {

            throw error;
        }


        // -------------------------------------------------
        // FILTER BULAN / TAHUN
        // -------------------------------------------------

        let rows =
            (data || [])
                .filter(row => {

                    const rowBulan =
                        clean(
                            row.bulan
                        );

                    const rowTahun =
                        Number(
                            row.tahun
                        );


                    return (
                        normaliseBulan(
                            rowBulan
                        ) ===
                        normaliseBulan(
                            bulan
                        )
                        &&
                        rowTahun ===
                        tahun
                    );
                });


        // -------------------------------------------------
        // NORMALISE
        // -------------------------------------------------

        rows =
            rows.map(
                normaliseRow
            );


        // -------------------------------------------------
        // FILTER POS
        // -------------------------------------------------

        if (pos) {

            rows =
                rows.filter(
                    row =>
                        clean(
                            row.pos
                        ).toUpperCase()
                        ===
                        clean(
                            pos
                        ).toUpperCase()
                );
        }


        // -------------------------------------------------
        // BASIC GAJI
        // -------------------------------------------------

        rows =
            await lengkapkanBasicGaji(
                rows
            );


        // -------------------------------------------------
        // SORT UTAMA
        //
        // TEMPAT TAMPUNGAN A-Z
        // -------------------------------------------------

        rows.sort(
            (a, b) => {

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


                return compareMalay(
                    a.no_skb,
                    b.no_skb
                );
            }
        );


        // -------------------------------------------------
        // BIL
        //
        // BIL DIBUAT SELEPAS SORT.
        // -------------------------------------------------

        rows =
            rows.map(
                (row, index) => ({
                    ...row,
                    bil:
                        index + 1
                })
            );


        // -------------------------------------------------
        // SIMPAN DATA
        // -------------------------------------------------

        dataTampungan =
            rows;


        // -------------------------------------------------
        // PAPAR
        // -------------------------------------------------

        renderTable();

        renderSummary();


        document.getElementById(
            "tajukLaporan"
        ).textContent =
            `TAMPUNGAN PENUH — ${bulan.toUpperCase()} ${tahun}`;


        document.getElementById(
            "subtajukLaporan"
        ).textContent =
            pos
                ? `POS KHIDMAT: ${pos} • SUSUNAN: TEMPAT TAMPUNGAN A–Z`
                : "SEMUA POS KHIDMAT • SUSUNAN: TEMPAT TAMPUNGAN A–Z";


        btnExcel.disabled =
            rows.length === 0;


        setStatus(
            `${rows.length} rekod dijumpai. Data telah disusun TEMPAT TAMPUNGAN A–Z.`,
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
            "Gagal mengambil data. Semak nama table dan column Supabase.",
            "error"
        );


    } finally {

        btnPapar.disabled =
            false;
    }
}


// =========================================================
// NORMALISE DATA
// =========================================================

function normaliseRow(row) {

    return {

        bil: 0,

        tempat:
            firstValue(
                row,
                [
                    "tempat_tampungan",
                    "pos_tampungan",
                    "tempattampungan"
                ]
            ),

        no_skb:
            firstValue(
                row,
                [
                    "no_skb",
                    "skb"
                ]
            ),

        nama:
            firstValue(
                row,
                [
                    "nama",
                    "nama_anggota"
                ]
            ),

        pos:
            firstValue(
                row,
                [
                    "pos",
                    "poskhidmat",
                    "pos_khidmat"
                ]
            ),

        gaji:
            toNumber(
                firstValue(
                    row,
                    [
                        "basic_gaji",
                        "gaji_pokok",
                        "gaji"
                    ]
                )
            ),

        jam:
            toNumber(
                firstValue(
                    row,
                    [
                        "jumlah_jam_tampung",
                        "jam_tampungan",
                        "jam_tampung",
                        "jumlah_jam",
                        "jam"
                    ]
                )
            ),

        klm:
            toNumber(
                firstValue(
                    row,
                    [
                        "jumlah_klm",
                        "klm",
                        "km_tampungan",
                        "rm_klm"
                    ]
                )
            )
    };
}


// =========================================================
// BASIC GAJI DARIPADA DATA ANGGOTA
// =========================================================

async function lengkapkanBasicGaji(
    rows
) {

    const missing =
        rows.filter(
            row =>
                !row.gaji
                &&
                row.no_skb
        );


    if (
        !missing.length
    ) {

        return rows;
    }


    const skbList =
        [
            ...new Set(
                missing
                    .map(
                        row =>
                            row.no_skb
                    )
                    .filter(Boolean)
            )
        ];


    if (
        !skbList.length
    ) {

        return rows;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from(TABLE_ANGGOTA)
            .select(
                "no_skb,nama,pos,gaji_pokok"
            )
            .in(
                "no_skb",
                skbList
            );


        if (error) {

            console.warn(
                "Gagal ambil BASIC GAJI:",
                error
            );

            return rows;
        }


        const map =
            new Map();


        (data || [])
            .forEach(
                member => {

                    map.set(
                        clean(
                            member.no_skb
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

                    return row;
                }


                return {

                    ...row,

                    nama:
                        row.nama ||
                        member.nama ||
                        "",

                    pos:
                        row.pos ||
                        member.pos ||
                        "",

                    gaji:
                        row.gaji ||
                        toNumber(
                            member.gaji_pokok
                        )
                };
            }
        );


    } catch (error) {

        console.warn(
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


    document.getElementById(
        "jumlahRekod"
    ).textContent =
        jumlahRekod.toLocaleString(
            "ms-MY"
        );


    document.getElementById(
        "jumlahJam"
    ).textContent =
        formatNumber(
            jumlahJam
        );


    document.getElementById(
        "jumlahKlm"
    ).textContent =
        `RM ${formatMoney(
            jumlahKlm
        )}`;
}


// =========================================================
// DOWNLOAD EXCEL
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


    const bulan =
        bulanEl.value;

    const tahun =
        tahunEl.value;

    const pos =
        posEl.value ||
        "SEMUA";


    // =====================================================
    // SANGAT PENTING
    //
    // GUNA dataTampungan YANG SAMA DENGAN PAPARAN.
    //
    // Oleh itu:
    // TEMPAT TAMPUNGAN A-Z
    // BIL sama
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


    worksheet["!cols"] = [

        { wch: 7 },

        { wch: 35 },

        { wch: 15 },

        { wch: 35 },

        { wch: 30 },

        { wch: 15 },

        { wch: 25 },

        { wch: 18 }
    ];


    // =====================================================
    // FORMAT RM / JAM
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

        const basicCell =
            XLSX.utils.encode_cell({
                r,
                c: 5
            });


        const jamCell =
            XLSX.utils.encode_cell({
                r,
                c: 6
            });


        const klmCell =
            XLSX.utils.encode_cell({
                r,
                c: 7
            });


        if (
            worksheet[basicCell]
        ) {

            worksheet[basicCell].z =
                "#,##0.00";
        }


        if (
            worksheet[jamCell]
        ) {

            worksheet[jamCell].z =
                "#,##0.##";
        }


        if (
            worksheet[klmCell]
        ) {

            worksheet[klmCell].z =
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
        pos === "SEMUA"
            ? "SEMUA"
            : sanitizeFilename(
                pos
            );


    const namaFail =
        `TAMPUNGAN_PENUH_${sanitizeFilename(
            bulan
        )}_${tahun}_${posFile}.xlsx`;


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

function firstValue(
    row,
    fields
) {

    for (
        const field of fields
    ) {

        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    row,
                    field
                )
            &&
            row[field] !==
                null
            &&
            row[field] !==
                undefined
            &&
            String(
                row[field]
            ).trim() !== ""
        ) {

            return row[field];
        }
    }


    return "";
}


// =========================================================
// CLEAN
// =========================================================

function clean(
    value
) {

    return String(
        value ?? ""
    ).trim();
}


// =========================================================
// NORMALISE BULAN
// =========================================================

function normaliseBulan(
    value
) {

    return clean(
        value
    )
        .toLowerCase()
        .replace(
            /[^a-z]/g,
            ""
        );
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
        value === ""
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
// SORT A-Z
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

    statusEl.textContent =
        message;

    statusEl.className =
        `status ${type}`;
}


// =========================================================
// DEBUG
// =========================================================

window.tampunganPenuh = {

    getData: () =>
        dataTampungan,

    paparData:
        paparData
};
