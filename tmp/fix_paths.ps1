$baseDir = "c:\Users\Administrador\Desktop\amem-ia\stitch"
Get-ChildItem -Path $baseDir -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName
    $modified = $false
    
    # 1. Corrigir caminhos relativos
    if ($content -match 'src="\.\.?/' -or $content -match 'href="\.\.?/') {
        $content = $content -replace 'src="(\.\./)+', 'src="/'
        $content = $content -replace 'src="\./', 'src="/'
        $content = $content -replace 'href="(\.\./)+', 'href="/'
        $content = $content -replace 'href="\./', 'href="/'
        $modified = $true
    }
    
    # 2. Adicionar type="module" em scripts que apontam para arquivos locais
    # Evita duplicar type="module"
    if ($content -match '<script src="/' -and -not ($content -match 'type="module"')) {
        $content = $content -replace '<script src="/', '<script type="module" src="/'
        $modified = $true
    }
    
    if ($modified) {
        $content | Set-Content $_.FullName
        Write-Host "Processed: $($_.FullName)"
    }
}
