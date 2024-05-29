console.log("terms dialog")

const modalTerm = document.getElementById('modal');
if (localStorage.getItem('checkTerms')) {
    document.getElementById('termMsg').style.display = 'none';
}

document.getElementById('openTermC').addEventListener('click', function () {
    modalTerm.showModal();
})

// Function to close the modal
function closeModal() {
    document.getElementById('modal').close();
}

document.getElementById('closeTerms').addEventListener('click', function () {
    localStorage.setItem('checkTerms', true);
    document.getElementById('termMsg').style.display = 'none';
    modalTerm.close();
})