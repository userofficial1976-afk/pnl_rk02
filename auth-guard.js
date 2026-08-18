// =====================================================
// AUTH GUARD
// FPB DUTY COMMAND CENTER V2
// =====================================================

(function(){

    const penggunaLogin =
        localStorage.getItem("pengguna");


    // =================================================
    // BELUM LOGIN
    // =================================================

    if(!penggunaLogin){

        window.location.href =
            "login.html";

        return;

    }


    // =================================================
    // SEMAK DATA PENGGUNA
    // =================================================

    try{

        const pengguna =
            JSON.parse(
                penggunaLogin
            );


        if(!pengguna){

            window.location.href =
                "login.html";

            return;

        }


        console.log(
            "AUTH OK:",
            pengguna.nama,
            pengguna.jawatan
        );


    }

    catch(error){

        console.error(
            "AUTH ERROR:",
            error
        );


        localStorage.removeItem(
            "pengguna"
        );


        localStorage.removeItem(
            "currentUser"
        );


        window.location.href =
            "login.html";

    }

})();
