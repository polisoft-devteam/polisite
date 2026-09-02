// Facts about the association itself.
//
// Not in messages/*.json: a proper noun isn't translated, and duplicating it per language
// means renaming the association in two places and missing one. Strings that mention the
// name take it as an ICU placeholder — see the Privacy and About namespaces.

export const ASSOCIATION_NAME = "Poli"

/** The full name, as the About page introduces it. */
export const ASSOCIATION_FULL_NAME = "PoliSoft Group"

/** Who to ask about the data the association holds. Named on the privacy page. */
export const ASSOCIATION_CONTACT_NAME = "Felix Morau"

/** Shown on the privacy page as the contact for data requests. */
export const ASSOCIATION_CONTACT_EMAIL = "kontakt@polisoft.se"
