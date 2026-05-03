export class NavConfig {

    public title: string;
    public label: string;
    public sds: string;
    public favorite: Favorite;
    public goto: string;
    public noteSource: string;
    public hideNemu: boolean;
    public ico: IcoConfig;
    public sourceId: number;

    constructor() {
        this.title = "";
        this.label = "";
        this.sds = "";
        this.favorite = new Favorite();
        this.goto = "";
        this.noteSource = "";
        this.hideNemu = false;
        this.ico = new IcoConfig();
        this.sourceId = 0;
    }
}

export class Favorite {
    active: boolean;
    url: string;
    id: number;
    toggleFavorite: boolean;
    viewDetail: boolean;

    constructor() {
        this.active = false;
        this.url = "";
        this.toggleFavorite = false;
        this.viewDetail = false;
        this.id = 0;
    }

}

export class IcoConfig {

    public menu: boolean = false;
    public favorite: boolean = false;
    public label: boolean = false;
    public sds: boolean = false;
    public source: boolean = false;
    public back: boolean = false;
    public logut: boolean = false;
    public home: boolean = false;
    public cart : boolean = false; 
}