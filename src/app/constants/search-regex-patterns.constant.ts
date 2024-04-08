export const PHRASE_REGEX = /^(?:"([^"~]*)")$/;
export const PROXIMITY_REGEX = /^(?:"(\w+)\s(\w+)")~(\d+)$/;
export const BOOSTING_REGEX =
  /(?:"([^"]*)"|(\w+))\^?(\d+)?\s(?:"([^"]*)"|(\w+))\^?(\d+)?/;
export const BOOLEAN_REGEX =
  /(?:"([^"]*)"|(\w+))\s?(AND|OR|NOT)?\s\+?(?:"([^"]*)"|(\w+))/;
export const PLUS_REGEX =
  /(\+?)(?:"([^"]*)"|(\w+))\s?\s(\+)?(?:"([^"]*)"|(\w+))/;

// (?:"some")[!@#$%^&*()\-_=+{}\[\]|;:'",.<>?`~\\]?\s*(\w+[,.\s]*){0,100}?(?:"public")
// some[!@#$%^&*()\-_=+{}\[\]|;:'",.<>?`~\\]*\s*(\w+[!@#$%^&*()\-_=+{}\[\]|;:'",.<>?`~\\]*){0,100}\bpublic\b
export const SPECIAL_SYMBOLS = "[!@#$%^&*()\\-_=+{}|;:'\",.<>?`~]*";
//center: (?:\\s+\\S+){0,${index}}\\s+

// verse[!@#$%^&*()\-_=+{}\[\]|;:'",.<>?`~\\]*(?:\s+\S+){0,10}\s+[!@#$%^&*()\-_=+{}\[\]|;:'",.<>?`~\\]*which