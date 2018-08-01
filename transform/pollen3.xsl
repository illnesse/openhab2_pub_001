<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:h="http://www.hikvision.com/ver20/XMLSchema">
    <xsl:output method="xml" indent="no" encoding="UTF-8" omit-xml-declaration="yes"  />
    <xsl:template match="/">
    <xsl:value-of select="/datasets/pollendaten/pollenbelastungen[3]/pollen[9]/@belastung"/>
    </xsl:template>
</xsl:stylesheet>