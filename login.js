async function login(){

    const no_skb =
        document.getElementById(
            "no_skb"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;


    const {
        data,
        error
    } = await supabaseClient

        .from("pengguna")

        .select("*")

        .eq(
            "no_skb",
            no_skb
        )

        .eq(
            "password",
            password
        )

        .single();


    if(
        error ||
        !data
    ){

        alert(
            "Login gagal"
        );

        return;

    }


    // =================================================
    // SIMPAN PENGGUNA
    // =================================================

    localStorage.setItem(
        "pengguna",
        JSON.stringify(data)
    );


    localStorage.setItem(
        "currentUser",
        JSON.stringify(data)
    );


    console.log(
        "LOGIN:",
        data
    );


    // =================================================
    // SEMAK JAWATAN
    // =================================================

    const jawatan =
        String(
            data.jawatan || ""
        )
        .trim()
        .toUpperCase();


    // =================================================
    // KETUA POS
    // =================================================

    if(
        jawatan === "KETUA POS"
    ){

        window.location.href =
            "rk02-pnl-data-entry.html";

    }


    // =================================================
    // PTW
    // =================================================

    else if(
        jawatan === "PTW"
    ){

        window.location.href =
            "rk02-pnl-data-entry.html";

    }


    // =================================================
    // LAIN-LAIN
    // =================================================

    else{

        alert(
            "Akses belum dibuka"
        );

    }

}


// =====================================================
// SEMAK JAWATAN
// =====================================================

const jawatan =
    String(
        data.jawatan || ""
    )
    .trim()
    .toUpperCase();


if(
    jawatan === "KETUA POS"
){

    window.location.href =
        "rk02-pnl-data-entry.html";

}


else if(
    jawatan === "PTW"
){

    window.location.href =
        "rk02-pnl-data-entry.html";

}


else{

    alert(
        "Akses belum dibuka"
    );

}
