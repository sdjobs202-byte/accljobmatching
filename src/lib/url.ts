/**
 * 사용자가 입력한 외부 링크(포트폴리오 등) 처리.
 *
 * 지원자가 적은 문자열이 기업·관리자 화면의 `href`로 그대로 들어가므로 두 가지를 막아야 한다.
 *  1) `javascript:` `data:` 같은 스킴 → 열람자 세션에서 스크립트가 실행된다(XSS).
 *  2) 스킴 없는 입력(`accl.kr`) → 브라우저가 상대경로로 해석해 엉뚱한 앱 내부 주소로 이동한다.
 *
 * 저장 시점과 렌더 시점 양쪽에서 통과시킨다. 렌더 쪽이 따로 필요한 이유는
 * 정규화 도입 이전에 저장된 값이 이미 DB에 있기 때문이고, 그 값들도 여기서 함께 구제된다.
 */

/** http/https만 통과. 그 외(javascript:, data:, 파싱 실패)는 null. */
function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * 스킴이 없으면 https를 붙여 재시도한다.
 * 유효한 http(s) URL이 아니면 null(= 링크 없음).
 */
export function normalizeExternalUrl(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  const direct = parseHttpUrl(raw);
  if (direct) return direct.toString();

  // "accl.kr", "www.accl.kr/works" 처럼 스킴만 빠진 경우 구제.
  // 스킴이 이미 있는데 http(s)가 아니었다면(javascript: 등) 여기서 되살리지 않는다.
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return null;
  return parseHttpUrl(`https://${raw}`)?.toString() ?? null;
}
