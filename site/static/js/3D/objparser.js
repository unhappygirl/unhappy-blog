


class ObjParser {
    constructor(newline="\n") {
        this.newline = newline;
        this.vertices = new Array();
        this.indices = new Array();
    
    }

    parse_array(arr) {
        let arrr = arr.splice(1, arr.length-1)
        for (const key in arrr) {
            const element = arrr[key];
            arrr[key] = + element;
        }
        return arrr;
    }

    identify_field(field) {
        switch (field.at(0)) {
            case "v":
                return this.vertices;
            
            case "f":
                return this.indices; //indexing starts from 1 in obj files!
        
            default:
                return null;
        }
    }

    parse(OBJ_str) {
        this.vertices = [];
        this.indices = [];
        const fields = OBJ_str.split(this.newline);
        let relevant_array;
        for (const field of fields) {
            relevant_array = this.identify_field(field)
            if (relevant_array == null) {
                continue;
            }
            let arr = field.split(' ')
            relevant_array.push(this.parse_array(arr))
        }
    }
}

