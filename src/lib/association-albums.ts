// Kept as the seed's source, not the page's: the albums live in archive_links now and
// are read from there. See scripts/seed-archive.mts.
//
// Shared photo albums.
//
// Everything but the label is read off the album's own page. The URL has to be the one
// Google's Share button produces — the short photos.app.goo.gl form, which expands to
// include the ?key= that lets someone open the album without already being shared in.
// A URL copied from the address bar is missing that key and gives a 404.
//
// Three albums have no public link yet, so they carry no cover and only open for someone
// Google already knows. Re-share them from the app to fix that.

export type AlbumGroup = "main" | "gaming"

export type PhotoAlbum = {
  group: AlbumGroup
  label: string
  /** The full share URL, including ?key= where the album has one. */
  url: string
  /** Google's own cover. The size suffix is ours — it serves any crop. */
  coverUrl?: string
  /** As Google reports it, so it stays in English. */
  dateRange?: string
}

export const PHOTO_ALBUMS: PhotoAlbum[] = [
  {
    group: "main",
    label: "Eurotrip 2026",
    url: "https://photos.google.com/share/AF1QipOusjOCIf-BTK0Zte5b_287gWVfKRTDkkWlff5dJDdmTXntvZ5peBwljoDeJqQlqw?key=ZFd1Vy1JazIxaTNjQ1JLSGVtRlRTa0pfNzV3UlF3",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczOVynO24NLnI0hQxEkLQDiIQkoyULW1gk7ZRdDAO7YL6kbbfOoA78cZLNm4S3MedrKRD5YoA5EmeinA4Lj5JAhzTWxH-vc3Kpd1efuI9eq3HznO-uU=w1200-h675-p-k-no",
    dateRange: "Sep 23, 2019 – Aug 2, 2026",
  },
  {
    group: "main",
    label: "Guldgossen 30 år i London",
    url: "https://photos.google.com/share/AF1QipPAY-Zocl0qlbJTRG7Zg7R4nx1VXCYyS84JpoXW5vD_gL2R7y0Ieqp8SDlGtb9vIQ?key=dWhvcG9mbkN0Y0s3VjdXUEQ0bGxldXZZd1JrcnhB",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczO-_AktDXnvXHv6KENzjyScBgAsYmae0NjLlWuu3LpuNQRMPB8a6ILW-i_tY5WqcUoa8hnsTE__9_pVltWfovFvmSbzzt6WqzM7r_e71ljMSnUTKZE=w1200-h675-p-k-no",
    dateRange: "Feb 6 – 9",
  },
  {
    group: "main",
    label: "Nytt år i Majorna '25",
    url: "https://photos.google.com/share/AF1QipPz2WFTpt0wJent8gVr0EiSj3ds2VkJz3lJcoMLc7fNesFFcjRORzURkJaKVwMDWA?key=YWIzMEw5SXUxZXM1dWdYTjZIZHVsbDVLbzlMbWtR",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczMwsLbcA1uiiYq9PkVl4nArMXCtSWn9uetWdIYPz-THkOIK2OmR-P3E15kONP7JI25bGXGJammwFDRygbok9Hh1iVp93pdKOaxNWgOorr_UaKkcleI=w1200-h675-p-k-no",
    dateRange: "Dec 27 – 31, 2025",
  },
  {
    group: "main",
    label: "Sommar på Vrångö 2025",
    url: "https://photos.google.com/share/AF1QipMSdJxuyZSv1TYb9jFzE8HT2KAlCVeAFstZm4UzExuywStfF-cgcpmwCtHOStcS6Q?key=YnhUUEd1ekNqQkZOTTd1WVBac2JVMktfR1JNZWZB",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczO3pgk2qj7znlMRNqdogkvwV6wF7unHAb88D6MjCfwHNBU9kdebWBaTei9CRIGX8A1CtG09PlwEBGtiBzeIFp7MocFxp7I1IeN1gwWN_ljj9ryO8tU=w1200-h675-p-k-no",
    dateRange: "Jul 13 – 23, 2025",
  },
  {
    group: "main",
    label: "Guldgossen i Köpenhamn Mark.29",
    url: "https://photos.google.com/share/AF1QipPTiKaDkG_pKA1wFvXaAMtxoIFbSZ5kyoVNxU4OaK8Xe1ST_iJ5I8GyQkCmAlIHBA?key=Q3lWNjc1emVDMmZXZ3B2dHEwak1CMUw0bFdZLUhR",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczNcs7aj2ZXO9RlhBKsmDo11ZxkwRjp9P1WZAuQxnffbi-jVCekcF54_ERaZlf-QNnDRSdGk4Q-LPQs-jQnmX3jvfMA2lhDag4q9Ao9ZwRriPayyTlg=w1200-h675-p-k-no",
    dateRange: "Feb 7 – 9, 2025",
  },
  {
    group: "main",
    label: "WW Malmö ’24",
    url: "https://photos.google.com/share/AF1QipPERTG3OBabUSjePKuNx5i8EXgvAXQ1hzD4SdmCyzHSQ4Yqcjl-moEtjicx4pkZNA?key=QnRyU2VnenV0VGRfYmtQb2xDZVktQ081WUdRQVBB",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczM2uk_UAx2Kvg-P7HXq5ME_4fC68gAtNhzdB6jiQKSMAv9xYivCrnyfCMnKLkhR-EO2OwK38cxKxIFs05UycEYu-aIaQH8knfAcabjPRxqkG7KL-Kc=w1200-h675-p-k-no",
    dateRange: "Oct 10 – 12, 2024",
  },
  {
    group: "main",
    label: "Landet runt ’24",
    url: "https://photos.google.com/share/AF1QipO8apHr6-WQZBAVdJ4oSfm8Gpy5Z1_LMyMnOLInb8bJWQkjc6dZlxa_wPSLIK10Tg?key=YmEtdG5td29lOXo5Tk43aFpvdTZzSEJMMFR4YnNB",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczPCJ9mDqr9D7NQxj_xza0Dixh2XAqGbr7Rqi3-8cbn_4EINWihSq9j5pKtYyJmjs36XydpE_iOgNwJ5_woWuLUOgltrJqiPx-V0lR9YgvuLlypn9fI=w1200-h675-p-k-no",
    dateRange: "Aug 3 – 8, 2024",
  },
  {
    group: "main",
    label: "Jacob 30 🎊",
    url: "https://photos.google.com/share/AF1QipOPgpzSb63gFYexdhFyvu6HalxCbZY07dTcrEExz5e6-crCGsTWvPD-eg_0VlwnjA?key=QkJzTTBXUURzR3V6SnRwbV9hUU83ZVhpRHgyeTFn",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczPuRV9X6ROyEitQHTAKVAeboUEQQM9FA3S2CgugUvnx3fJn7UDVC5JzlZhP_d_v_isybBHSFDIj2r-ZQFnHP5xcb_qUTN_yAb1vbg3ANaCnLJtZFOU=w1200-h675-p-k-no",
    dateRange: "Jun 1 – 2, 2024",
  },
  {
    group: "main",
    label: "En helt vanlig valborg i Malmö",
    url: "https://photos.google.com/share/AF1QipMfT58dSNyErQ8n6UYhYPoN2_942jyqVzQ9vPgEbM5Y3usOZVQfBJSt-VZ6i8ddJQ?key=VklKcWgwLXJWaXUxUFJ3WEt5dEZzU04tSlZlcnpn",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczPPuhsytGXhDdL9o3NCZ9CEIvC_jijxkesRNG0PwwSnu4WTqKmw7VL6gMMR7hadFQJWLueUI3uCXi-a3QS9QyHYRWDIyvz7hC_5YVgr4T58i3nS4Ts=w1200-h675-p-k-no",
    dateRange: "Apr 29 – May 1, 2024",
  },
  {
    group: "main",
    label: "Polispain 2023",
    url: "https://photos.google.com/share/AF1QipMO1IABMfjVQz5BVw2_3aQ4BE6DkAqOrmTZyJr3iIpTCqv-kH1Xx36Oxj3oXF6fHw?key=ckRPbkVXbjlDWUdvU1pHRWFZenE3aXRZYVV3QjFn",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczMIKblc1t3eSUBJNWTkZpsQ8yCCQxf-FW0eFQUuFb1GeTctONSu1vYs7iVI0qoAB26KoBtxP_YZ-St2EkQj64HU7KU7siM8ch-1b5IdZiBj89Zy80Q=w1200-h675-p-k-no",
    dateRange: "Feb 6 – 13, 2023",
  },
  {
    group: "main",
    label: "Europol 2022",
    url: "https://photos.google.com/share/AF1QipN5JBHir0Ebjubm1q4cTjKwDVv7WtZHQW7i-v_EM8qkX17JZ7UCOezftnRQjJGDNw?key=VDRMZU5pdTBWRE9uc0ZVZk53bVFMbk9HMEo5RXB3",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczMEfRFdzQGyvLtUetYm5FvdMfFtlW4ES922eQplHj3dETQN-mIa8hr254GIZwoZapwNJfq-yhDSEbUvgtxSfCTq47-TZHSc6MziejoDc3W27etjwV4=w1200-h675-p-k-no",
    dateRange: "Aug 1 – 10, 2022",
  },
  {
    group: "main",
    label: "Polisoft Origin Story",
    url: "https://photos.google.com/share/AF1QipPK7PEoT1LXMBYnUANYMk0JHDQ6tj11GdKZ-qXdg2IEMJ5HgMOEpxs9OUFU3qSiMA?key=NGM5Q2N0MHNJdGNyVFh2QlpaN0ZtMFEwZXJ1U3Rn",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczMkXwdp9Nm0Pn1EemoALxf7dOtiDEh8sAhHo-cl0IGjz__MnGeFy4GHrtK4We1_ObKE1RL6rgngBvbJphS3wbxzlg2MTc6eGLOF0Rge6O2O6GTnfIpM=w1200-h675-p-k-no",
    dateRange: "Aug 22, 2020 – Feb 14, 2022",
  },
  {
    group: "main",
    label: "Guld gossen i Köpenhamn",
    url: "https://photos.google.com/share/AF1QipOSLouDyrUhZKCRRxrkj6chVSvFpPXUJ5hxudg5tGrYnHbhqXwR9Au4gKbU9-yBmQ",
  },
  {
    group: "main",
    label: "Eurotrip 2023",
    url: "https://photos.google.com/share/AF1QipP5EZlisI_LXM0B4-SJprDZlwTLXErver7BSBIfczq8a9HHTHPZF5UIhvcgbCPX_Q",
  },
  {
    group: "main",
    label: "Sommar i Majorna 2020",
    url: "https://photos.google.com/share/AF1QipPHwQXmSCzPTWS9wKhl-0qViOf489U5b4BQnfCvSMJJhntJ-Wp5xljPGTcsg3zYSw",
  },
  {
    group: "gaming",
    label: "PoliForest",
    url: "https://photos.google.com/share/AF1QipPD8GHT-GRvXj57ZuKJ40t8hcMImVFQCV1_zlTfBOE0i076LNbqkxnbrZV7mxUSjQ?key=YTFaTjZ6N1hHV0hlSUVHbWtPY2E4a19rcDBsRXF3",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczNUXF6HyKukoiZmyifEfYWACCx91mjDNUyPzZxTFq5yVuFuSho7RWg_jyZAjQspPqpg0D8jvY-kSvn2BoFTs49J1-DdMDJoBXiIfMoN1olkBzRVX5A=w1200-h675-p-k-no",
    dateRange: "Apr 23 – May 7, 2024",
  },
  {
    group: "gaming",
    label: "Minecräfterz",
    url: "https://photos.google.com/share/AF1QipMwRT8ViW8oOblG-2fBBLW04l_zMGaA6pAbaVGSU24DEslj2jdxz2P2FrL5Ih6oKQ?key=UURKalZRbHV3U29mT0phZ001cHpaS3lxNDN3MGdR",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczMZ3-5cryyqATsjhoZdhm3NwVBiRMNwmzCTaLM-a6llaaD_bOxBhS6374TQgPhYugQATR2vAEtgMzhpGyrQ3bK_jw5b5Z3Cu7OwF1FrkH_k6gQAZT4=w1200-h675-p-k-no",
    dateRange: "Feb 27, 2020 – Jan 18, 2022",
  },
  {
    group: "gaming",
    label: "TBC LVLARNA",
    url: "https://photos.google.com/share/AF1QipN_4nT5pVnC9j3Djk1ak47qi-BhQPxdkRvUODqtxxhvFuuPDaW0U9XphkamK5CSgA?key=WkxSYXA4U0d6ZzNWZFdZVzNNS1padHZRSG9SYmVR",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczNisSQkW2122IV3zeIicANbdThhDkwTdx8ST7mX_KVEOGAuKg84Wabu79oTL7uL7S-gnjXEEyIGSNo706JsW9KrrueekEguuEUtBDRNtG-Oi73R7DA=w1200-h675-p-k-no",
    dateRange: "Jun 19, 2012 – Apr 13, 2019",
  },
]
