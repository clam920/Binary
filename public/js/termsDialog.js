console.log("terms dialog")

const modalTerm = document.getElementById('modal');

document.getElementById('openTermC').addEventListener('click', function () {
    modalTerm.showModal();
})

// Function to close the modal
function closeModal() {
    document.getElementById('modal').close();
}

document.getElementById('closeTerms').addEventListener('click', function () {
    modalTerm.close();
})