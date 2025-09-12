import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export function Modal({ open, onClose, title, children, footer }){
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-card-surface text-text-primary shadow-xl">
                {title && (
                  <div className="px-4 py-3 border-b border-white/5">
                    <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
                  </div>
                )}
                <div className="p-4">{children}</div>
                {footer && <div className="px-4 py-3 border-t border-white/5">{footer}</div>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
