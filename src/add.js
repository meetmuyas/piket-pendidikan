import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  Timestamp,
  addDoc,
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

// Add event listener to the button for redirection
document.getElementById("buttonClose").addEventListener("click", function () {
  // Redirect to index.html
  window.location.href = "index.html";
});

// Fetch the dates JSON file
fetch("../dist/json/dates.json")
  .then((response) => response.json())
  .then((data) => {
    // Get the section where we will append the dates
    const displayDate = document.querySelector("h1");
    // Helper function to get the nearest Sunday from today
    function getNearestSunday() {
      const today = new Date();
      const dayOfWeek = today.getDay();
      // Calculate the difference to the next Sunday (if today is not Sunday)
      const distanceToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const nearestSunday = new Date(today);
      nearestSunday.setDate(today.getDate() + distanceToSunday);
      // Set time to midnight for consistent date comparison
      nearestSunday.setHours(0, 0, 0, 0);
      return nearestSunday;
    }

    // Helper function to check if today matches a date in the data
    function isTodayMatch(dateObj) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Clear time for accurate comparison
      const eventDate = new Date(dateObj.dateOfPendidikan);
      eventDate.setHours(0, 0, 0, 0); // Clear time for accurate comparison
      return today.getTime() === eventDate.getTime();
    }

    // Get the nearest Sunday
    const nearestSunday = getNearestSunday();

    // Find the first date that is >= nearest Sunday or today matches
    const nearestSundayDate = data.dates.find((dateObj) => {
      const eventDate = new Date(dateObj.dateOfPendidikan);
      eventDate.setHours(0, 0, 0, 0); // Clear time for accurate comparison
      return eventDate >= nearestSunday || isTodayMatch(dateObj);
    });

    const dateFormatted = new Date(
      nearestSundayDate.dateOfPendidikan
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Now you have the nearest Sunday date in nearestSundayDate
    if (nearestSundayDate) {
      displayDate.innerHTML = `
      Bantu Pendidikan:
      <br />
      Ahad, ${dateFormatted}
      `;
      displayDate.setAttribute("data-id", nearestSundayDate.dateOfPendidikan);
    } else {
      console.log("No upcoming dates found.");
    }
  })
  .catch((error) => console.error("Error fetching dates:", error));

// Add event listener to the button
document.getElementById("button-lanjut").addEventListener("click", function () {
  // Get the name input value
  const inputNama = document.querySelector("input[type='text']").value.trim();

  // Get the necessary DOM elements
  const buttonBack = document.getElementById("buttonBack");

  // Get the necessary DOM elements
  const namaJadwalWrapper = document.getElementById("nama-jadwal-wrapper");
  const namaPIC = document.getElementById("nama-pic");
  const warningNamaPIC = document.getElementById("warning-nama-pic");

  // Reset sectionAssignment div before appending new content
  const sectionAssignment = document.getElementById("pic-ahad");
  sectionAssignment.innerHTML = ""; // Clear previous content

  // Check for errors in the input fields and radio buttons
  let inputError = false;

  // If name input is empty
  if (!inputNama) {
    inputError = true;
    namaPIC.classList.add("border", "border-red-500");
    warningNamaPIC.innerHTML = "Nama harus diisi";
    warningNamaPIC.className =
      "py-2 bg-red-500 text-white text-center border border-red-500 rounded-t-xl";
    warningNamaPIC.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (inputError) {
    // Scroll into view of the first error found
    if (inputError) {
      warningNamaPIC.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  } else {
    // Proceed if there are no errors
    buttonBack.classList.remove("hidden");
    buttonClose.classList.remove("ml-auto");
    namaJadwalWrapper.classList.add("hidden");
    namaPIC.classList.add("hidden");

    // Hide the 'Lanjut' button using Tailwind's hidden class
    document.getElementById("button-lanjut").classList.add("hidden");
    // Show the 'Lunch Status' button by removing Tailwind's hidden class
    const lunchStatus = document.getElementById("lunch-status");
    if (lunchStatus) {
      lunchStatus.classList.remove("hidden");
      lunchStatus.classList.add("flex", "flex-col", "gap-4");
    }

    // Show the 'Kirim' button by removing Tailwind's hidden class
    document.getElementById("button-submit").classList.remove("hidden");

    document.getElementById("pic-ahad").classList.remove("hidden");

    // Change the header page count from "Halaman 1/2" to "Halaman 2/2"
    const halaman = document.getElementById("halaman");
    if (halaman) {
      halaman.textContent = "Halaman 2/2";
    }
  }

  // Function to handle radio button selection and change label classes
  const lunchRadios = document.querySelectorAll('input[name="lunch"]');

  // Function to update classes
  function updateLunchLabelClasses() {
    lunchRadios.forEach((r) => {
      const label = document.querySelector(`label[for="${r.id}"]`);
      if (label) {
        label.className = "text-gray-950 border border-gray-300 font-bold"; // Reset all labels
      }
    });

    // Get the selected radio's label and change its class
    const selectedRadio = document.querySelector('input[name="lunch"]:checked');
    if (selectedRadio) {
      const selectedLabel = document.querySelector(
        `label[for="${selectedRadio.id}"]`
      );
      if (selectedLabel) {
        selectedLabel.className =
          "text-gray-950 bg-gray-300 border border-gray-950 font-bold";
      }
    }
  }

  // Attach event listener for change event
  lunchRadios.forEach((radio) => {
    radio.addEventListener("change", updateLunchLabelClasses);
  });

  // Ensure the correct class is applied on page load if one of the radios is already selected
  updateLunchLabelClasses();

  // Fetch the dates and picData JSON files
  Promise.all([
    fetch("../dist/json/dates.json").then((response) => response.json()),
    fetch("../dist/json/pic.json").then((response) => response.json()),
  ])
    .then(([dateData, picData]) => {
      const h1Date = document.querySelector("h1");
      const datePicked = h1Date.getAttribute("data-id");

      // Find the matching date object from dateData
      const selectedDateEntry = dateData.dates.find(
        (dateEntry) => dateEntry.dateOfPendidikan === datePicked
      );
      // If a matching date entry is found
      if (selectedDateEntry) {
        // Section for assignments
        const sectionAssignment = document.getElementById("pic-ahad");
        sectionAssignment.classList.remove("border", "border-red-500");
        const warningPICAhad = document.createElement("p");
        warningPICAhad.id = "warning-pic-ahad";
        warningPICAhad.className =
          "py-2 bg-red-500 text-white text-center rounded-t-xl hidden";
        sectionAssignment.appendChild(warningPICAhad);

        Object.entries(selectedDateEntry.events).forEach(
          ([key, [eventTitle, eventType, sectionId]]) => {
            const lunchStatus = document.getElementById("lunch-status");
            const nameValue = document.querySelector("#nama-pic input").value;
            if (eventType === "via-zoom") {
              lunchStatus.classList.add("hidden");
            } else {
              lunchStatus.classList.remove("hidden");
              const h2Lunch = lunchStatus.querySelector("h2");
              h2Lunch.innerText = `${nameValue} mau ambil jatah makan siang gratis?`;
            }

            const divAssignment = document.createElement("div");
            divAssignment.className =
              "bg-gray-100 flex flex-col gap-4 pt-4 pb-6 mx-4 border-b-2 border-b-gray-400 border-dashed last:border-b-0";

            const h2Assignment = document.createElement("h2");
            h2Assignment.innerHTML = `${nameValue} mau bantu ${eventTitle} sebagai:`;
            h2Assignment.className =
              "text-gray-950 text-xl font-bold text-center";
            sectionAssignment.appendChild(divAssignment);
            divAssignment.appendChild(h2Assignment);

            const picAssignments = picData.pic;
            const eventPIC = picAssignments.find(
              (pic) => pic.event === sectionId
            );

            Object.values(eventPIC.assignments).forEach(({ picId, type }) => {
              const paraMatches = document.createElement("p");
              paraMatches.id = `${picId}`;

              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.value = picId; // Set checkbox value to picId
              checkbox.id = `checkbox-${picId}`;

              const label = document.createElement("label");
              label.setAttribute("for", checkbox.id);
              label.textContent = type;
              label.className =
                "text-gray-950 border border-gray-300 font-bold";

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

                const selectedCheckboxes = document.querySelectorAll(
                  'input[type="checkbox"]:checked'
                );

                if (selectedCheckboxes.length > 0) {
                  sectionAssignment.classList.remove(
                    "border",
                    "border-red-500"
                  );
                  warningPICAhad.innerHTML = "";
                  warningPICAhad.classList.add("hidden");
                }
              });
            });
          }
        );
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
});

// Add event listener to the input field for the user typing
document
  .querySelector("input[type='text']")
  .addEventListener("input", function () {
    const namaPIC = document.getElementById("nama-pic");
    const warningNamaPIC = document.getElementById("warning-nama-pic");

    // Remove the error classes when the user starts typing
    namaPIC.classList.remove("border", "border-red-500");

    // Clear the warning message
    warningNamaPIC.innerHTML = "";
    warningNamaPIC.className = "hidden"; // Reset the class if necessary
  });

// Add event listener to the button for redirection
document.getElementById("buttonBack").addEventListener("click", function () {
  // Change the header page count from "Halaman 1/2" to "Halaman 2/2"
  const halaman = document.getElementById("halaman");
  if (halaman) {
    halaman.textContent = "Halaman 1/2";
  }
  // Get the necessary DOM elements
  const namaJadwalWrapper = document.getElementById("nama-jadwal-wrapper");
  const namaPIC = document.getElementById("nama-pic");

  namaJadwalWrapper.classList.remove("hidden");
  namaPIC.classList.remove("hidden");

  const lunchStatus = document.getElementById("lunch-status");
  if (lunchStatus) {
    // If it exists, add the hidden class
    lunchStatus.classList.add("hidden");
  }
  document.getElementById("pic-ahad").classList.add("hidden");
  document.getElementById("button-submit").classList.add("hidden");
  document.getElementById("button-lanjut").classList.remove("hidden");
});

// Add event listener to the lunch radio buttons
const lunchOptions = document.querySelectorAll("input[name='lunch']");
lunchOptions.forEach((radio) => {
  radio.addEventListener("change", function () {
    const lunchStatus = document.getElementById("lunch-status");
    lunchStatus.classList.remove("border", "border-red-500");

    // Optionally, clear the warning message
    const warningLunchStatus = document.getElementById("warning-lunch-status");
    warningLunchStatus.innerHTML = ""; // Clear warning message
    warningLunchStatus.className = "hidden"; // Hide warning
  });
});

// Add event listener to the button for redirection
document.getElementById("button-submit").addEventListener("click", function () {
  // Get the input values
  const nameValue = document.querySelector("#nama-pic input").value;

  const h1Date = document.querySelector("h1");
  const datePicked = h1Date.getAttribute("data-id");
  const dateFormatted = new Date(datePicked).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Create a Date object from the date string
  const date = new Date(datePicked);

  // Create the Firestore Timestamp
  const contributionDateValue = Timestamp.fromDate(date);

  // Get the selected lunch status value
  const selectedLunch = document.querySelector("input[name='lunch']:checked");
  const lunchValue = selectedLunch ? selectedLunch.value : false;

  // Get the array of selected checkboxes from 'pic-ahad'
  const selectedCheckboxes = document.querySelectorAll(
    '#pic-ahad input[type="checkbox"]:checked'
  );
  const contributionIdArray = Array.from(selectedCheckboxes).map(
    (checkbox) => checkbox.value
  );

  const lunchStatus = document.getElementById("lunch-status");
  const warningLunchStatus = document.getElementById("warning-lunch-status");
  const picAhad = document.getElementById("pic-ahad");
  const warningPICAhad = document.getElementById("warning-pic-ahad");

  let lunchError = false;
  let picError = false;

  // Reset warning styles at the start
  if (warningLunchStatus) {
    warningLunchStatus.className = "";
  }
  if (warningPICAhad) {
    warningPICAhad.className = "";
  }
  if (lunchStatus) {
    lunchStatus.classList.remove("border", "border-red-500");
  }
  picAhad.classList.remove("border", "border-red-500");

  if (
    lunchStatus.className === "bg-gray-100 rounded-2xl mb-4 flex flex-col gap-4"
  ) {
    if (!lunchValue) {
      // Check if lunchStatus exists
      lunchError = true;
      lunchStatus.classList.add("border", "border-red-500");
      warningLunchStatus.innerHTML = "Pilih salah satu";
      warningLunchStatus.className =
        "py-2 bg-red-500 text-white text-center border border-red-500 rounded-t-xl";
      warningLunchStatus.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Check for contributions
  if (contributionIdArray.length === 0) {
    picError = true;
    picAhad.classList.add("border", "border-red-500");
    warningPICAhad.innerHTML = "Pilih minimal 1 amanah";
    warningPICAhad.className =
      "py-2 bg-red-500 text-white text-center border border-red-500 rounded-t-xl";
    warningPICAhad.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (lunchError || picError) {
    warningLunchStatus.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  // Add document to Firestore, regardless of lunch status
  addDoc(colRef, {
    name: nameValue,
    contribution_date: contributionDateValue,
    lunch: lunchValue,
    contribution_id: contributionIdArray,
  })
    .then(() => {
      console.log("Document successfully updated!");

      // Show success snackbar
      showSnackbar(
        `Berhasil menambahkan ${nameValue} ke jadwal piket pada hari Ahad, ${dateFormatted}`,
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

// Snackbar function definition remains unchanged
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
