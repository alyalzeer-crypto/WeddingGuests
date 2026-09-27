/* =========================================================
   المتغيرات المشتركة
========================================================= */

let currentUser = null;

let currentProfile = null;


/* =========================================================
   تحميل الجلسة والمستخدم
========================================================= */

async function initializeUser() {

    const {
        data: { session },
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (
        error ||
        !session
    ) {

        window.location.href =
            "index.html";

        return false;
    }


    currentUser =
        session.user;


    const profileLoaded =
        await loadCurrentProfile();


    if (!profileLoaded) {

        await supabaseClient
            .auth
            .signOut();


        window.location.href =
            "index.html";

        return false;
    }


    updateUserInterface();


    return true;
}


/* =========================================================
   تحميل Profile
========================================================= */

async function loadCurrentProfile() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("profiles")

            .select(
                "username, role"
            )

            .eq(
                "id",
                currentUser.id
            )

            .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return false;
    }


    currentProfile =
        data;


    return true;
}


/* =========================================================
   تحديث بيانات المستخدم في الصفحة
========================================================= */

function updateUserInterface() {

    const userInfo =
        document.getElementById(
            "currentUserInfo"
        );


    const username =
        document.getElementById(
            "welcomeUsername"
        );


    const role =
        document.getElementById(
            "welcomeRole"
        );


    const roleText =
        currentProfile.role ===
        "admin"
            ? "مدير"
            : "عضو";


    if (userInfo) {

        userInfo.textContent =
            `${currentProfile.username} - ${roleText}`;
    }


    if (username) {

        username.textContent =
            currentProfile.username;
    }


    if (role) {

        role.textContent =
            currentProfile.role ===
            "admin"
                ? "حساب المدير"
                : "حساب عضو";
    }
}


/* =========================================================
   تسجيل الخروج
========================================================= */

async function logoutUser() {

    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        showToast(
            "حدث خطأ أثناء تسجيل الخروج",
            "error"
        );

        return;
    }


    window.location.href =
        "index.html";
}


/* =========================================================
   Toast
========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;
    }


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );
    }


    toast.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   توحيد الأسماء
========================================================= */

function normalizeName(name) {

    return name
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}


/* =========================================================
   حماية HTML
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}