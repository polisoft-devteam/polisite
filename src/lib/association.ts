// Facts about the association itself.
//
// Not in messages/*.json: a proper noun isn't translated, and duplicating it per language
// means renaming the association in two places and missing one. Strings that mention the
// name take it as an ICU placeholder — see the Privacy and About namespaces.

export const ASSOCIATION_NAME = "Poli"

/** The full name, as the About page introduces it. */
export const ASSOCIATION_FULL_NAME = "PoliSoft Group"

/**
 * The office answerable for the association's data, not the person in it.
 *
 * The privacy page asks the database who holds this and names them. A name written here
 * would be one nobody thinks to change the day they stand down, and it would go on saying
 * "ask Felix" long after Felix stopped being the one to ask.
 */
export const ASSOCIATION_DATA_CONTACT_TITLE = "legalCounsel"

/** Shown on the privacy page as the contact for data requests. */
export const ASSOCIATION_CONTACT_EMAIL = "kontakt@polisoft.se"
