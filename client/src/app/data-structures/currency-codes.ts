export type CurrencyInfo = {
    name: string;
    symbol: string;
};

export const currencyMap: Record<string, CurrencyInfo> = {
    "GBP": { name: "Pound sterling", symbol: "£" },
    "EUR": { name: "Euro", symbol: "€" },
    "USD": { name: "United States dollar", symbol: "$" },
    "AFN": { name: "Afghan afghani", symbol: "؋" },
    "ALL": { name: "Albanian lek", symbol: "Lek" },
    "DZD": { name: "Algerian dinar", symbol: "د.ج" },
    "AOA": { name: "Angolan kwanza", symbol: "Kz" },
    "ARS": { name: "Argentine peso", symbol: "$" },
    "AMD": { name: "Armenian dram", symbol: "֏" },
    "AWG": { name: "Aruban florin", symbol: "ƒ" },
    "AUD": { name: "Australian dollar", symbol: "$" },
    "AZN": { name: "Azerbaijani manat", symbol: "₼" },
    "BSD": { name: "Bahamian dollar", symbol: "$" },
    "BHD": { name: "Bahraini dinar", symbol: ".د.ب" },
    "BDT": { name: "Bangladeshi taka", symbol: "৳" },
    "BBD": { name: "Barbados dollar", symbol: "$" },
    "BYN": { name: "Belarusian ruble", symbol: "Br" },
    "BZD": { name: "Belize dollar", symbol: "BZ$" },
    "BMD": { name: "Bermudian dollar", symbol: "$" },
    "BTN": { name: "Bhutanese ngultrum", symbol: "Nu." },
    "BOV": { name: "Bolivian Mvdol", symbol: "" },
    "BOB": { name: "Boliviano", symbol: "$b" },
    "BAM": { name: "Bosnia and Herzegovina convertible mark", symbol: "KM" },
    "BWP": { name: "Botswana pula", symbol: "P" },
    "BRL": { name: "Brazilian real", symbol: "R$" },
    "BND": { name: "Brunei dollar", symbol: "$" },
    "BGN": { name: "Bulgarian lev", symbol: "лв" },
    "BIF": { name: "Burundian franc", symbol: "FBu" },
    "KHR": { name: "Cambodian riel", symbol: "៛" },
    "CAD": { name: "Canadian dollar", symbol: "$" },
    "CVE": { name: "Cape Verdean escudo", symbol: "$" },
    "KYD": { name: "Cayman Islands dollar", symbol: "$" },
    "XOF": { name: "CFA franc BCEAO", symbol: "CFA" },
    "XAF": { name: "CFA franc BEAC", symbol: "CFA" },
    "XPF": { name: "CFP franc", symbol: "₣" },
    "CLP": { name: "Chilean peso", symbol: "$" },
    "COP": { name: "Colombian peso", symbol: "$" },
    "KMF": { name: "Comoro franc", symbol: "CF" },
    "CDF": { name: "Congolese franc", symbol: "FC" },
    "CRC": { name: "Costa Rican colon", symbol: "₡" },
    "CUP": { name: "Cuban peso", symbol: "₱" },
    "CZK": { name: "Czech koruna", symbol: "Kč" },
    "DKK": { name: "Danish krone", symbol: "kr" },
    "DJF": { name: "Djiboutian franc", symbol: "Fdj" },
    "DOP": { name: "Dominican peso", symbol: "RD$" },
    "XCD": { name: "East Caribbean dollar", symbol: "$" },
    "EGP": { name: "Egyptian pound", symbol: "£" },
    "ERN": { name: "Eritrean nakfa", symbol: "Nfk" },
    "ETB": { name: "Ethiopian birr", symbol: "Br" },
    "FKP": { name: "Falkland Islands pound", symbol: "£" },
    "FJD": { name: "Fiji dollar", symbol: "$" },
    "GMD": { name: "Gambian dalasi", symbol: "D" },
    "GEL": { name: "Georgian lari", symbol: "₾" },
    "GHS": { name: "Ghanaian cedi", symbol: "₵" },
    "GIP": { name: "Gibraltar pound", symbol: "£" },
    "GTQ": { name: "Guatemalan quetzal", symbol: "Q" },
    "GNF": { name: "Guinean franc", symbol: "FG" },
    "GYD": { name: "Guyanese dollar", symbol: "$" },
    "HTG": { name: "Haitian gourde", symbol: "G" },
    "HNL": { name: "Honduran lempira", symbol: "L" },
    "HKD": { name: "Hong Kong dollar", symbol: "$" },
    "HUF": { name: "Hungarian forint", symbol: "Ft" },
    "ISK": { name: "Icelandic króna", symbol: "kr" },
    "INR": { name: "Indian rupee", symbol: "₹" },
    "IDR": { name: "Indonesian rupiah", symbol: "Rp" },
    "IRR": { name: "Iranian rial", symbol: "﷼" },
    "IQD": { name: "Iraqi dinar", symbol: "ع.د" },
    "ILS": { name: "Israeli new shekel", symbol: "₪" },
    "JMD": { name: "Jamaican dollar", symbol: "J$" },
    "JPY": { name: "Japanese yen", symbol: "¥" },
    "JOD": { name: "Jordanian dinar", symbol: "د.ا" },
    "KZT": { name: "Kazakhstani tenge", symbol: "₸" },
    "KES": { name: "Kenyan shilling", symbol: "KSh" },
    "KWD": { name: "Kuwaiti dinar", symbol: "د.ك" },
    "KGS": { name: "Kyrgyzstani som", symbol: "лв" },
    "LAK": { name: "Lao kip", symbol: "₭" },
    "LBP": { name: "Lebanese pound", symbol: "ل.ل" },
    "LSL": { name: "Lesotho loti", symbol: "L" },
    "LRD": { name: "Liberian dollar", symbol: "$" },
    "LYD": { name: "Libyan dinar", symbol: "ل.د" },
    "MOP": { name: "Macanese pataca", symbol: "MOP$" },
    "MKD": { name: "Macedonian denar", symbol: "ден" },
    "MGA": { name: "Malagasy ariary", symbol: "Ar" },
    "MWK": { name: "Malawian kwacha", symbol: "MK" },
    "MYR": { name: "Malaysian ringgit", symbol: "RM" },
    "MVR": { name: "Maldivian rufiyaa", symbol: "ރ." },
    "MRU": { name: "Mauritanian ouguiya", symbol: "UM" },
    "MUR": { name: "Mauritian rupee", symbol: "₨" },
    "MXN": { name: "Mexican peso", symbol: "$" },
    "MXV": { name: "Mexican Unidad de Inversion (UDI) (funds code)", symbol: "N/A" },
    "MDL": { name: "Moldovan leu", symbol: "lei" },
    "MNT": { name: "Mongolian tögrög", symbol: "₮" },
    "MAD": { name: "Moroccan dirham", symbol: "د.م." },
    "MZN": { name: "Mozambican metical", symbol: "MT" },
    "MMK": { name: "Myanmar kyat", symbol: "K" },
    "NAD": { name: "Namibian dollar", symbol: "$" },
    "NPR": { name: "Nepalese rupee", symbol: "₨" },
    "ANG": { name: "Netherlands Antillean guilder", symbol: "ƒ" },
    "TWD": { name: "New Taiwan dollar", symbol: "NT$" },
    "NZD": { name: "New Zealand dollar", symbol: "$" },
    "NIO": { name: "Nicaraguan córdoba", symbol: "C$" },
    "NGN": { name: "Nigerian naira", symbol: "₦" },
    "XXX": { name: "No currency", symbol: "N/A" },
    "KPW": { name: "North Korean won", symbol: "₩" },
    "NOK": { name: "Norwegian krone", symbol: "kr" },
    "OMR": { name: "Omani rial", symbol: "ر.ع." },
    "PKR": { name: "Pakistani rupee", symbol: "₨" },
    "XPD": { name: "Palladium (one troy ounce)", symbol: "N/A" },
    "PAB": { name: "Panamanian balboa", symbol: "B/." },
    "PGK": { name: "Papua New Guinean kina", symbol: "K" },
    "PYG": { name: "Paraguayan guaraní", symbol: "₲" },
    "PEN": { name: "Peruvian sol", symbol: "S/." },
    "PHP": { name: "Philippine peso", symbol: "₱" },
    "XPT": { name: "Platinum (one troy ounce)", symbol: "N/A" },
    "PLN": { name: "Polish złoty", symbol: "zł" },
    "QAR": { name: "Qatari riyal", symbol: "ر.ق" },
    "CNY": { name: "Renminbi", symbol: "¥" },
    "RON": { name: "Romanian leu", symbol: "lei" },
    "RUB": { name: "Russian ruble", symbol: "₽" },
    "RWF": { name: "Rwandan franc", symbol: "FRw" },
    "SHP": { name: "Saint Helena pound", symbol: "£" },
    "SVC": { name: "Salvadoran colón", symbol: "₡" },
    "WST": { name: "Samoan tala", symbol: "T" },
    "STN": { name: "São Tomé and Príncipe dobra", symbol: "Db" },
    "SAR": { name: "Saudi riyal", symbol: "ر.س" },
    "RSD": { name: "Serbian dinar", symbol: "дин." },
    "SCR": { name: "Seychelles rupee", symbol: "₨" },
    "SLE": { name: "Sierra Leonean leone", symbol: "Le" },
    "XAG": { name: "Silver (one troy ounce)", symbol: "N/A" },
    "SGD": { name: "Singapore dollar", symbol: "$" },
    "SBD": { name: "Solomon Islands dollar", symbol: "$" },
    "SOS": { name: "Somalian shilling", symbol: "Sh" },
    "ZAR": { name: "South African rand", symbol: "R" },
    "KRW": { name: "South Korean won", symbol: "₩" },
    "SSP": { name: "South Sudanese pound", symbol: "SSP" },
    "XDR": { name: "Special drawing rights", symbol: "N/A" },
    "LKR": { name: "Sri Lankan rupee", symbol: "₨" },
    "XSU": { name: "SUCRE", symbol: "N/A" },
    "SDG": { name: "Sudanese pound", symbol: "ج.س." },
    "SRD": { name: "Surinamese dollar", symbol: "$" },
    "SZL": { name: "Swazi lilangeni", symbol: "E" },
    "SEK": { name: "Swedish krona", symbol: "kr" },
    "CHF": { name: "Swiss franc", symbol: "CHF" },
    "SYP": { name: "Syrian pound", symbol: "£" },
    "TJS": { name: "Tajikistani somoni", symbol: "SM" },
    "TZS": { name: "Tanzanian shilling", symbol: "TSh" },
    "THB": { name: "Thai baht", symbol: "฿" },
    "TOP": { name: "Tongan paʻanga", symbol: "T$" },
    "TTD": { name: "Trinidad and Tobago dollar", symbol: "$" },
    "TND": { name: "Tunisian dinar", symbol: "د.ت" },
    "TRY": { name: "Turkish lira", symbol: "₺" },
    "TMT": { name: "Turkmenistan manat", symbol: "m" },
    "UGX": { name: "Ugandan shilling", symbol: "USh" },
    "UAH": { name: "Ukrainian hryvnia", symbol: "₴" },
    "CLF": { name: "Unidad de Fomento", symbol: "N/A" },
    "COU": { name: "Unidad de Valor Real", symbol: "N/A" },
    "UYW": { name: "Unidad previsional", symbol: "N/A" },
    "AED": { name: "United Arab Emirates dirham", symbol: "د.إ" },
    "UYI": { name: "Uruguay Peso en Unidades Indexadas", symbol: "N/A" },
    "UYU": { name: "Uruguayan peso", symbol: "$" },
    "UZS": { name: "Uzbekistani sum", symbol: "лв" },
    "VUV": { name: "Vanuatu vatu", symbol: "Vt" },
    "VED": { name: "Venezuelan digital bolívar", symbol: "Bs.D" },
    "VES": { name: "Venezuelan sovereign bolívar", symbol: "Bs.S" },
    "VND": { name: "Vietnamese đồng", symbol: "₫" },
    "CHE": { name: "WIR euro (complementary currency)", symbol: "N/A" },
    "CHW": { name: "WIR franc (complementary currency)", symbol: "N/A" },
    "YER": { name: "Yemeni rial", symbol: "ر.ي" },
    "ZMW": { name: "Zambian kwacha", symbol: "K" },
    "ZWG": { name: "Zimbabwe Gold", symbol: "N/A" }
};

export const currencyList: { name: string; code: string }[] = Object.keys(currencyMap).map(key => ({
    name: currencyMap[key].name,
    code: key,
}));;
