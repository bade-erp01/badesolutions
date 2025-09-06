module.exports = function OnboardingTemplate (data,link) {
    return(

        `<p>welcome ${data.firstName}. <a href="${link}">Login Here<a/></p>
        `
    )
}