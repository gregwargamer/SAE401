<?php

namespace App\Util;

final class GeoNameResolver
{
    /** @var array<string, string> */
    private static array $departments = [];

    /** @var array<string, string> */
    private static array $regions = [];

    private static bool $loaded = false;

    public static function departmentName(string $code, ?string $fallback = null): ?string
    {
        self::load();
        return self::$departments[$code] ?? $fallback;
    }

    public static function regionName(string $code, ?string $fallback = null): ?string
    {
        self::load();
        return self::$regions[$code] ?? $fallback;
    }

    private static function load(): void
    {
        if (self::$loaded) {
            return;
        }

        self::$loaded = true;

        $sqlPath = dirname(__DIR__, 3) . '/data/saequatrecentun_db2.sql';
        if (!is_readable($sqlPath)) {
            return;
        }

        $content = file_get_contents($sqlPath);
        if ($content === false) {
            return;
        }

        self::extractRegions($content);
        self::extractDepartments($content);
    }

    private static function extractRegions(string $content): void
    {
        $regionPos = strpos($content, "INSERT INTO `region`");
        if ($regionPos === false) {
            return;
        }

        $regionBlock = substr($content, $regionPos);
        if ($regionBlock === false) {
            return;
        }

        if (!preg_match_all("/\(\d+,\s*'([^']+)',\s*'([^']+)'\)/u", $regionBlock, $matches, PREG_SET_ORDER)) {
            return;
        }

        foreach ($matches as $match) {
            $code = $match[1];
            $name = self::unescapeSqlString($match[2]);
            self::$regions[$code] = $name;
        }
    }

    private static function extractDepartments(string $content): void
    {
        if (!preg_match_all("/^\(\d+,\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',/m", $content, $matches, PREG_SET_ORDER)) {
            return;
        }

        foreach ($matches as $match) {
            $depCode = $match[1];
            $depName = self::unescapeSqlString($match[2]);
            $regionCode = $match[3];

            self::$departments[$depCode] = $depName;

            if (!isset(self::$regions[$regionCode])) {
                // Region names normally come from the region INSERT block.
                self::$regions[$regionCode] = $regionCode;
            }
        }
    }

    private static function unescapeSqlString(string $value): string
    {
        return str_replace(["\\'", "''"], ["'", "'"], $value);
    }
}
