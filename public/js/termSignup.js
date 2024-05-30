const modalTC = document.getElementById('modal');
document.getElementById('openTermC').addEventListener('click', ()=>{
    modalTC.showModal();
});

document.getElementById('closeTerms').addEventListener('click', () =>{
    modalTC.close();
});

const checkTerm = document.getElementById('acceptCondition');

document.getElementById('acceptTerms').addEventListener('click', () =>{
    modalTC.close();
    checkTerm.setAttribute('checked', 'true');
});