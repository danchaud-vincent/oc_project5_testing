export const getByDataTest = (fixture: any, dataAtt: string): HTMLElement => {
  return fixture.nativeElement.querySelector(`[data-test="${dataAtt}"]`);
};
