$usedEmails = @{}

function Get-UniqueEmail($base) {
    $email = $base
    $counter = 1
    while ($usedEmails.ContainsKey($email)) {
        $counter++
        $email = $base -replace '\.ma$', "$counter.ma"
    }
    $usedEmails[$email] = $true
    return $email
}

$sectors = @('Industrie','Finance','Technologie','Telecom','Pharmaceutique','Hotellerie','Logistique','Energie','Construction','Conseil','RH','Commerce','Distribution','Transport','Sante','Education','Agriculture','Tourisme','Immobilier','Services','Agroalimentaire','Automobile','Cosmetique','Environnement','Qualite','Sécurité','Media','Aeronautique','Chimie','Textile')
$companyTypes = @('privee','multinationale','pme','publique','startup','cabinet','ong')
$sizes = @('1-10','11-50','51-200','201-500','501-1000','1000+')
$cities = @('Casablanca','Casablanca','Casablanca','Casablanca','Casablanca','Casablanca','Casablanca','Casablanca','Casablanca','Casablanca','Rabat','Rabat','Rabat','Tanger','Tanger','Marrakech','Marrakech','Fès','Agadir','Meknes','Kenitra','Oujda','Tetouan','Safi','Mohammedia','Khouribga','Settat','Berrechid','El Jadida','Nador')
$cityDomains = @{
    'Casablanca' = @('casa','casa-business','casa-trade','atlas','bourgogne','ainSebaa','ainChock','sidiBernoussi','mesnana','tarik','anfa')
    'Rabat' = @('rabat','agdal','hayRiad','helAl','technopolis')
    'Tanger' = @('tanger','tangier','gzenaya','tangierMed')
    'Marrakech' = @('marrakech','gueliz','hivernage','palmeraie')
    'Fès' = @('fes','fesMedina','volubilis')
    'Agadir' = @('agadir','sonaba','founty')
}
$descriptions = @('Solutions professionnelles','Services experts','Leader du marche','Innovation et qualite','Excellence operateure','Partenaire de confiance','Groupement industriel','Services specialises','Consulting et conseil','Production et distribution','Fabrication et export','Import et distribution','Commerce international','Prestations de services','Etudes et formation','Recherche et developpement','Management et strategie','Technologies avancees','Solutions digitales','Services financiers','Assurance et gestion','Immobilier et promotion','Tourisme et hotellerie','Logistique et transport','Energie et environnement','Sante et bien-etre','Education et formation','Agroalimentaire','Textile et confection','Chimie et pharmacie')
$domains = @('Direction','DRH','Recrutement','Formation','Qualite','Production','Finance','Commercial','Marketing','Communication','Informatique','Logistique','Juridique','Achats','Export','Import','Recherche','Innovation','Digital','Strategie','Patrimoine','Securite','Maintenance','Engineering','Audit','Conseil','RH','General')

$entries = @()

# Generate realistic company names and emails
$companyPrefixes = @('Atlas','Royal','Royal','Atlas','National','Premium','Elite','Smart','Advanced','Modern','Dynamic','Global','International','First','Prime','Pro','Tech','Info','Net','Data','Cloud','Digital','Smart','Green','Eco','Bio','Al','Oriental','Maghreb','Sahel','Sud','Nord','Est','Ouest','Cent','Atlantic','Med','Medi','Océan','Atlas','Mediterranean','Sahara','Toubkal','Anti','Rif','Dakhla','Essaouira','Agadir','Fes','Marrakech','Rabat','Casa','Tanger','Oujda','Kenitra','Meknes')
$companySuffixes = @('Group','Services','Solutions','Tech','Tech','Consulting','Partners','Holdings','International','Maroc','Morocco','SARL','SA','SAS','Co','Enterprise','Corp','Plus','Pro','Express','Global','Hub','Lab','Factory','Work','Trade','Market','Connect','Link','Bridge','Gate','Way','Path','Vision','Focus','Point','Zone','Space','Park','Center','Centre','Base','Core','Edge','Net','Web','Hub','Lab','Box','Pad','Pad')

$counter = 0
while ($entries.Count -lt 850) {
    $counter++
    if ($counter -gt 20000) { break }
    
    $sector = $sectors | Get-Random
    $type = $companyTypes | Get-Random
    $size = $sizes | Get-Random
    $city = $cities | Get-Random
    
    $prefix = $companyPrefixes | Get-Random
    $suffix = $companySuffixes | Get-Random
    $companyName = "$prefix $suffix"
    
    # Generate email from company name
    $emailBase = ($companyName.ToLower() -replace '[^a-z0-9]', '').Substring(0, [Math]::Min(20, ($companyName.ToLower() -replace '[^a-z0-9]').Length))
    $domain = $domains | Get-Random
    $domainLetter = $domain.ToLower() -replace '[^a-z]', ''
    if ($domainLetter.Length -gt 4) { $domainLetter = $domainLetter.Substring(0,4) }
    
    $emailPatterns = @(
        "$emailBase@$emailBase.ma",
        "hr@$emailBase.ma",
        "recrutement@$emailBase.ma",
        "recruitment@$emailBase.ma",
        "contact@$emailBase.ma",
        "info@$emailBase.ma",
        "$domainLetter@$emailBase.ma",
        "jobs@$emailBase.ma",
        "carriere@$emailBase.ma",
        "rh@$emailBase.ma"
    )
    $email = $emailPatterns | Get-Random
    $email = Get-UniqueEmail $email
    
    $cityDomain = $cityDomains[$city] | Get-Random
    $website = "www.$emailBase.ma"
    
    $phoneBase = switch ($city) {
        'Casablanca' { '5-22' }
        'Rabat' { '5-37' }
        'Tanger' { '5-39' }
        'Marrakech' { '5-24' }
        'Fès' { '5-35' }
        'Agadir' { '5-28' }
        'Meknes' { '5-35' }
        'Kenitra' { '5-37' }
        'Oujda' { '5-36' }
        'Tetouan' { '5-39' }
        'Safi' { '5-24' }
        'Mohammedia' { '5-22' }
        'Khouribga' { '5-23' }
        'Settat' { '5-23' }
        'Berrechid' { '5-22' }
        'El Jadida' { '5-23' }
        'Nador' { '5-36' }
        default { '5-22' }
    }
    $num1 = Get-Random -Minimum 30 -Maximum 99
    $num2 = Get-Random -Minimum 1000 -Maximum 9999
    $phone = "+212-$phoneBase-$num1-$num2"
    
    $domain2 = $domains | Get-Random
    $desc = $descriptions | Get-Random
    
    $entry = "  { companyName: '$companyName', email: '$email', website: '$website', sector: '$sector', domain: '$domain2', companyType: '$type', companySize: '$size', city: '$city', country: 'Maroc', phone: '$phone', description: '$desc' },"
    $entries += $entry
}

# Output entries
$entries | ForEach-Object { Write-Output $_ }
