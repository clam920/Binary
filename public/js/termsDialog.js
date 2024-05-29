console.log("terms dialog")
// function openModal() {
// }
const modalTerm = document.getElementById('modal');

document.getElementById('openTerms').addEventListener('click', function () {
    modalTerm.showModal();
})

// Function to close the modal
function closeModal() {
    document.getElementById('modal').close();
}

// Close the modal if the user clicks outside of the modal content
window.onclick = function (event) {
    var modal = document.getElementById('modal');
    if (event.target.nodeName === 'DIALOG' && !modal.contains(event.target)) {
        modal.close();
    }
}