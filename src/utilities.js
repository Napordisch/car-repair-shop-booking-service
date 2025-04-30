import pkg from "cookie-parser"

import {AddressError} from "./errors.js";
import {Address} from "./Address.js";
import {TimeOfDay} from "./pages/static/js/TimeOfDay.js";

const {cookieParser} = pkg;

export function getAddress(req, res) {
    try {
        return Address.create(req.body.address);
    } catch (error) {
        console.error(error);
        if (error instanceof AddressError) {
            console.error(error);
            res.status(400);
            res.send(error.message);
            return null;
        }
    }
}

