

class SideBarInitializer {
    constructor(DOM) {
        this.DOM = DOM;
        this.sidebar = DOM.getElementsByClassName("sidebar")[0];
    }
    
    get_elements() {
        this.list_elements = Array.from(this.DOM.getElementsByClassName("sb-element"));
        
    }

    add_listeners() {
        let relevant_section;
        this.list_elements.forEach(element => {
            element.addEventListener("click", (e) => {
                relevant_section = this.DOM.getElementById(e.target.getAttribute("target"));
                relevant_section.scrollIntoView({behavior: "smooth" });
            });
        });
    }

    init() {
        this.get_elements();
        this.add_listeners();
    }
}