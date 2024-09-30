import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
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

        title.innerHTML = `Ubah: ${contName}`;

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

        if (dateMatches) {
          const sectionLunch = document.createElement("section");
          sectionLunch.className =
            "bg-gray-100 p-4 rounded-2xl mb-4 flex flex-col gap-4";

          const h2Lunch = document.createElement("h2");
          h2Lunch.innerHTML = "Mau ambil jatah makan siang gratis?";
          h2Lunch.className = "text-gray-950 text-xl font-bold text-center";
          main.appendChild(sectionLunch);
          sectionLunch.appendChild(h2Lunch);

          // Radio buttons for lunch selection
          const radioLunchYes = document.createElement("input");
          radioLunchYes.type = "radio";
          radioLunchYes.name = "lunchOption";
          radioLunchYes.value = true;
          radioLunchYes.id = "radio-lunch-yes";

          const radioLunchNo = document.createElement("input");
          radioLunchNo.type = "radio";
          radioLunchNo.name = "lunchOption";
          radioLunchNo.value = false;
          radioLunchNo.id = "radio-lunch-no";

          const labelLunchYes = document.createElement("label");
          labelLunchYes.setAttribute("for", "radio-lunch-yes");
          labelLunchYes.textContent = "Mau dong";

          const labelLunchNo = document.createElement("label");
          labelLunchNo.setAttribute("for", "radio-lunch-no");
          labelLunchNo.textContent = "Gak dulu";

          // Set the checked state and styles based on the current lunch data (contLunch)
          if (contLunch) {
            radioLunchYes.checked = true;
            labelLunchYes.className =
              "text-gray-950 bg-gray-300 border border-gray-950 font-bold"; // Add class when checked
            labelLunchNo.className =
              "text-gray-950 border border-gray-300 font-bold"; // Reset the other label
          } else {
            radioLunchNo.checked = true;
            labelLunchNo.className =
              "text-gray-950 bg-gray-300 border border-gray-950 font-bold"; // Add class when checked
            labelLunchYes.className =
              "text-gray-950 border border-gray-300 font-bold"; // Reset the other label
          }

          // Append radio buttons and labels
          sectionLunch.appendChild(radioLunchYes);
          sectionLunch.appendChild(labelLunchYes);
          sectionLunch.appendChild(radioLunchNo);
          sectionLunch.appendChild(labelLunchNo);

          // Event listeners to update styles on selection
          radioLunchYes.addEventListener("change", () => {
            if (radioLunchYes.checked) {
              labelLunchYes.className =
                "text-gray-950 bg-gray-300 border border-gray-950 font-bold";
              labelLunchNo.className =
                "text-gray-950 border border-gray-300 font-bold";
            }
          });
          radioLunchNo.addEventListener("change", () => {
            if (radioLunchNo.checked) {
              labelLunchNo.className =
                "text-gray-950 bg-gray-300 border border-gray-950 font-bold";
              labelLunchYes.className =
                "text-gray-950 border border-gray-300 font-bold";
            }
          });

          // Section for assignments
          const sectionAssignment = document.createElement("section");
          sectionAssignment.className =
            "bg-gray-100 rounded-xl flex flex-col gap-2";
          main.appendChild(sectionAssignment);
          const paraWarning = document.createElement("p");
          paraWarning.classList = "hidden";
          sectionAssignment.appendChild(paraWarning);

          Object.entries(dateMatches.events).forEach(
            ([key, [eventTitle, eventType, sectionId]]) => {
              if (eventType === "via-zoom") {
                sectionLunch.remove();
              }
              const divAssignment = document.createElement("div");
              divAssignment.className =
                "bg-gray-100 flex flex-col gap-4 pt-4 pb-6 mx-4 border-b-2 border-b-gray-400 border-dashed last:border-b-0";
              divAssignment.id = "assignment-ahad";

              const h2Assignment = document.createElement("h2");
              h2Assignment.innerHTML = `Bantu ${eventTitle} sebagai:`;
              h2Assignment.className =
                "text-gray-950 text-xl font-bold text-center";
              sectionAssignment.appendChild(divAssignment);
              divAssignment.appendChild(h2Assignment);

              const picAssignments = picData.pic;
              const eventPIC = picAssignments.find(
                (pic) => pic.event === sectionId
              );

              // Render checkboxes for each assignment
              Object.values(eventPIC.assignments).forEach(({ picId, type }) => {
                const matchedContId = contId.includes(picId);
                const paraMatches = document.createElement("p");
                paraMatches.id = `${picId}`;

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = picId; // Set checkbox value to picId
                checkbox.id = `checkbox-${picId}`;

                const label = document.createElement("label");
                label.setAttribute("for", checkbox.id);
                label.textContent = type;

                // Check the checkbox if it matches
                if (matchedContId) {
                  checkbox.checked = true;
                  label.className =
                    "text-gray-950 bg-gray-300 border border-gray-950 font-bold";
                } else {
                  label.className =
                    "text-gray-950 border border-gray-300 font-bold";
                }

                // Append checkbox and label to paragraph
                paraMatches.appendChild(checkbox);
                paraMatches.appendChild(label);

                // Append the paragraph to the assignment section
                divAssignment.appendChild(paraMatches);

                // Update background color based on checkbox status
                checkbox.addEventListener("change", () => {
                  if (checkbox.checked) {
                    label.className =
                      "text-gray-950 bg-gray-300 border border-gray-950 font-bold";
                  } else {
                    label.className =
                      "text-gray-950 border border-gray-300 font-bold";
                  }

                  // Check if any checkbox is selected and hide the warning if true
                  const selectedCheckboxes = document.querySelectorAll(
                    'input[type="checkbox"]:checked'
                  );

                  if (selectedCheckboxes.length > 0) {
                    sectionAssignment.classList.remove(
                      "border",
                      "border-red-500"
                    );
                    paraWarning.classList.add("hidden");
                  }
                });
              });
            }
          );

          // Submit
          const buttonSubmit = document.createElement("button");
          buttonSubmit.className = "w-full max-w-screen-xs my-4 px-4";

          const paraButtonSubmit = document.createElement("p");
          paraButtonSubmit.innerText = "Simpan";
          paraButtonSubmit.className =
            "w-full p-4 rounded-xl bg-gray-950 text-white font-bold";
          footer.appendChild(buttonSubmit);
          buttonSubmit.appendChild(paraButtonSubmit);

          // Submit button functionality
          buttonSubmit.addEventListener("click", function () {
            // Get all checked checkboxes
            const selectedCheckboxes = document.querySelectorAll(
              'input[type="checkbox"]:checked'
            );

            // Check if at least one checkbox is selected
            if (selectedCheckboxes.length === 0) {
              // Show the warning and add a red border to sectionAssignment
              sectionAssignment.classList.add("border", "border-red-500");
              paraWarning.innerHTML = "Pilih minimal 1 amanah";
              paraWarning.className =
                "py-2 bg-red-500 text-white text-center border border-red-500 rounded-t-xl";

              // Scroll to the warning paragraph
              paraWarning.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });

              return; // Prevent form submission
            }

            const selectedIds = Array.from(selectedCheckboxes).map(
              (checkbox) => checkbox.value
            );

            const selectedLunchInput = document.querySelector(
              'input[name="lunchOption"]:checked'
            );
            const selectedLunch = selectedLunchInput
              ? selectedLunchInput.value
              : false;
            console.log(selectedLunch);

            // Update Firestore with the new contribution_id
            const docRef = doc(db, "contributions", contDataId); // Replace with your collection name
            updateDoc(docRef, {
              contribution_id: selectedIds,
              lunch: selectedLunch === "true",
            })
              .then(() => {
                console.log("Document successfully updated!");

                // Show success snackbar
                showSnackbar(
                  `Data perbantuan ${contName} berhasil diubah`,
                  "success"
                );

                // Redirect to index.html after 2 seconds
                setTimeout(() => {
                  window.location.href = "index.html";
                }, 2000); // 2 seconds delay before redirecting
              })
              .catch((error) => {
                console.error("Error updating document: ", error);

                // Show error snackbar
                showSnackbar("Terjadi kesalahan. Silakan coba lagi.", "error");
              });
          });

          // Function to show snackbar
          function showSnackbar(message, type) {
            // Create the snackbar element
            const snackbar = document.createElement("div");
            snackbar.innerText = message;
            snackbar.className = "snackbar";

            // Apply different styles for success and error
            if (type === "success") {
              snackbar.classList.add("snackbar-success");
            } else if (type === "error") {
              snackbar.classList.add("snackbar-error");
            }

            // Append to the body
            document.body.appendChild(snackbar);

            // Show the snackbar for 3 seconds
            setTimeout(() => {
              snackbar.classList.add("show");
              setTimeout(() => {
                snackbar.classList.remove("show");
                document.body.removeChild(snackbar);
              }, 3000); // Snackbar stays visible for 3 seconds
            }, 100);
          }
        }
      });
    }
  });
});
