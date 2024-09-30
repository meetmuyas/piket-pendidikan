import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD51T-VWi0Bu7EFL9sBK6m1D3YKAbXZIjA",
  authDomain: "pendidikan-yisc.firebaseapp.com",
  projectId: "pendidikan-yisc",
  storageBucket: "pendidikan-yisc.appspot.com",
  messagingSenderId: "925770161526",
  appId: "1:925770161526:web:5adb6ec56562226934ee57",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference to the collection
const colRef = collection(db, "contributions");

const urlParams = new URLSearchParams(window.location.search);
const dataId = urlParams.get("id");

// Add event listener to the button
document
  .getElementById("buttonRedirect")
  .addEventListener("click", function () {
    // Redirect to index.html
    window.location.href = "index.html";
  });

getDocs(colRef).then((snapshot) => {
  snapshot.docs.forEach((docSnapshot) => {
    const contDataId = docSnapshot.id;
    const contName = docSnapshot.data().name;
    const contId = docSnapshot.data().contribution_id;
    const contDate = docSnapshot.data().contribution_date;
    const contLunch = docSnapshot.data().lunch;

    if (contDataId === dataId) {
      Promise.all([
        fetch("../dist/json/dates.json").then((response) => response.json()),
        fetch("../dist/json/pic.json").then((response) => response.json()),
      ]).then(([datesData, picData]) => {
        const firestoreDate = new Date(
          contDate.seconds * 1000 + contDate.nanoseconds / 1000000
        );
        const localDate = new Date(
          firestoreDate.toLocaleString("en-US", {
            timeZone: "Asia/Jakarta",
          })
        );
        const isoDateString = localDate.toISOString().split(".")[0] + "Z";
        const dateAtAhadArray = datesData.dates;

        const dateMatches = dateAtAhadArray.find(
          (pic) => pic.dateOfPendidikan === isoDateString
        );

        const title = document.querySelector("title");
        const header = document.querySelector("header");
        const main = document.querySelector("main");
        const footer = document.querySelector("footer");

        title.innerHTML = `Detail: ${contName}`;

        const detailName = document.createElement("h1");
        detailName.innerHTML = `${contName}`;
        detailName.className =
          "mt-8 text-2xl font-bold text-gray-950 text-center";
        header.appendChild(detailName);

        const date = new Date(dateMatches.dateOfPendidikan);
        const options = { day: "2-digit", month: "short", year: "numeric" };
        const formattedDate = date.toLocaleDateString("id-ID", options);

        const detailDate = document.createElement("p");
        detailDate.innerHTML = `Bantu Pendidikan pada:<br/><strong>Ahad, ${formattedDate}</strong>`;
        detailDate.className = "text-gray-500 text-center pt-2";
        header.appendChild(detailDate);

        // Create the "Edit" button
        const buttonUbah = document.createElement("button");
        buttonUbah.className = "w-full max-w-screen-xs mt-4 px-4";
        buttonUbah.id = "button-edit";

        const paraButtonUbah = document.createElement("p");
        paraButtonUbah.innerText = "Ubah";
        paraButtonUbah.className =
          "w-full p-4 rounded-xl bg-gray-950 text-white font-bold";
        footer.appendChild(buttonUbah);
        buttonUbah.appendChild(paraButtonUbah);

        // Create the "Delete" button
        const buttonHapus = document.createElement("button");
        buttonHapus.className = "w-full max-w-screen-xs my-4 px-4";
        buttonHapus.id = "button-delete";

        const paraButtonHapus = document.createElement("p");
        paraButtonHapus.innerText = "Hapus";
        paraButtonHapus.className =
          "w-full p-4 rounded-xl bg-gray-100 border border-gray-300 text-red-500 font-bold";
        footer.appendChild(buttonHapus);
        buttonHapus.appendChild(paraButtonHapus);

        if (dateMatches) {
          const sectionLunch = document.createElement("section");
          sectionLunch.className =
            "bg-gray-200 p-4 rounded-2xl mb-4 flex flex-col gap-4";
          sectionLunch.id = "lunch-status";

          const h2Lunch = document.createElement("h2");
          h2Lunch.innerHTML = "Mau ambil jatah makan siang gratis?";
          h2Lunch.className = "text-gray-400 text-xl font-bold text-center";
          main.appendChild(sectionLunch);
          sectionLunch.appendChild(h2Lunch);

          const paraLunch = document.createElement("p");
          const responseParaLunch = contLunch ? "Mau" : "Gak";
          paraLunch.className = "text-center text-gray-400";
          paraLunch.innerHTML = responseParaLunch;
          sectionLunch.appendChild(paraLunch);

          const sectionAssignment = document.createElement("section");
          sectionAssignment.className =
            "bg-gray-200 px-4 rounded-xl flex flex-col gap-2";
          main.appendChild(sectionAssignment);

          Object.entries(dateMatches.events).forEach(
            ([key, [eventTitle, eventType, sectionId]]) => {
              const lunchStatus = document.getElementById("lunch-status");
              if (eventType === "via-zoom") {
                lunchStatus.classList.add("hidden");
              }

              const divAssignment = document.createElement("div");
              divAssignment.className =
                "bg-gray-200 flex flex-col gap-4 pt-4 pb-6 border-b-2 border-b-gray-400 border-dashed last:border-b-0";
              divAssignment.id = "assignment-ahad";

              const h2Assignment = document.createElement("h2");
              h2Assignment.innerHTML = `Bantu ${eventTitle} sebagai:`;
              h2Assignment.className =
                "text-gray-400 text-xl font-bold text-center";

              // Append the h2Assignment to divAssignment
              divAssignment.appendChild(h2Assignment);

              // Append the divAssignment to sectionAssignment
              sectionAssignment.appendChild(divAssignment);

              const picAssignments = picData.pic;
              const eventPIC = picAssignments.find(
                (pic) => pic.event === sectionId
              );

              // Initialize a flag to track if any matches are found
              let hasMatches = false;

              // Loop through the eventPIC assignments
              Object.values(eventPIC.assignments).forEach(({ picId, type }) => {
                const matchedContId = contId.find((id) => id === picId);

                // If a match is found, create and append a paragraph
                if (matchedContId) {
                  const paraMatches = document.createElement("p");
                  paraMatches.id = `${picId}`;
                  paraMatches.innerHTML = `${type}`;
                  paraMatches.className = "text-center text-gray-400";
                  divAssignment.appendChild(paraMatches);

                  // Set the flag to true if there's at least one match
                  hasMatches = true;
                }
              });

              // Remove the entire divAssignment if no matches are found
              if (!hasMatches) {
                divAssignment.remove();
              }
            }
          );

          buttonUbah.addEventListener("click", function () {
            // Get the current URL
            const currentUrl = new URL(window.location.href);

            // Extract the "id" parameter from the current URL
            const idParam = currentUrl.searchParams.get("id");

            // Redirect to /edit.html with the same id
            if (idParam) {
              window.location.href = `/edit.html?id=${idParam}`;
            } else {
              console.error("No 'id' parameter found in the URL.");
            }
          });

          buttonHapus.addEventListener("click", function () {
            event.preventDefault();
            const confirmDelete = confirm(
              "Apakah Anda yakin ingin menghapus data ini?"
            );
            console.log(confirmDelete);
            if (confirmDelete) {
              const docRef = doc(db, "contributions", contDataId);
              deleteDoc(docRef)
                .then(() => {
                  console.log("Document successfully deleted!");

                  // Show success message (snackbar)
                  showSnackbarDelete(
                    `Berhasil menghapus ${contName} dari jadwal piket di hari Ahad, ${formattedDate}`,
                    "success"
                  );

                  // Redirect to index.html after 2 seconds
                  setTimeout(() => {
                    window.location.href = "index.html";
                  }, 2000); // 2 seconds delay before redirecting
                })
                .catch((error) => {
                  console.error("Error deleting document: ", error);

                  // Show error message (snackbar)
                  showSnackbarDelete(
                    "Terjadi kesalahan. Silakan coba lagi.",
                    "error"
                  );
                });
            }
          });

          // Function to show snackbar
          function showSnackbarDelete(message, type) {
            // Create the snackbar element
            const snackbarDelete = document.createElement("div");
            snackbarDelete.innerText = message;
            snackbarDelete.className = "snackbar";

            // Apply different styles for success and error
            if (type === "success") {
              snackbarDelete.classList.add("snackbar-success");
            } else if (type === "error") {
              snackbarDelete.classList.add("snackbar-error");
            }

            // Append to the body
            document.body.appendChild(snackbarDelete);

            // Show the snackbar for 3 seconds
            setTimeout(() => {
              snackbarDelete.classList.add("show");
              setTimeout(() => {
                snackbarDelete.classList.remove("show");
                document.body.removeChild(snackbarDelete);
              }, 3000); // Snackbar stays visible for 3 seconds
            }, 100);
          }
        }
      });
    }
  });
});
